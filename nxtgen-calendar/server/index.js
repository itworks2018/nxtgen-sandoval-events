import express from "express";
import cors from "cors";
import pg from "pg";
import crypto from "node:crypto";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const { Pool } = pg;

// ---------- auth: teacher-code login issues a short-lived signed token ----------
// Writes (PUT/DELETE) require a valid token obtained via POST /auth/login.
// This keeps the teacher code check on the server instead of trusting the client.
const TEACHER_CODE_KEY = "nxtgen-sandoval-events:teacher-code";
const DEFAULT_TEACHER_CODE = process.env.DEFAULT_TEACHER_CODE || "sandoval2026";
const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
  console.warn(
    "WARNING: AUTH_SECRET is not set. Using an insecure development fallback — set AUTH_SECRET in production."
  );
}
const SIGNING_SECRET = AUTH_SECRET || "dev-only-insecure-secret-change-me";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SIGNING_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expectedSig = crypto.createHmac("sha256", SIGNING_SECRET).update(data).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "unauthorized" });
  next();
}

// Render's managed Postgres gives you DATABASE_URL automatically once the
// database is created and linked to this service.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT NOT NULL,
      shared BOOLEAN NOT NULL DEFAULT false,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (key, shared)
    );
  `);
}

const app = express();
app.use(helmet());
app.use(express.json({ limit: "5mb" }));

// Restrict this to your real Vercel domain once you have it, e.g.
// origin: "https://nxtgen-sandoval-events.vercel.app"
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));

// General abuse protection for the whole API.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Tighter limit on login attempts to slow down teacher-code brute forcing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// POST /auth/login  body: { code: string }
app.post("/auth/login", authLimiter, async (req, res) => {
  const { code } = req.body || {};
  if (typeof code !== "string" || !code) return res.status(400).json({ error: "code required" });
  let expected = DEFAULT_TEACHER_CODE;
  try {
    const result = await pool.query(
      "SELECT value FROM kv_store WHERE key = $1 AND shared = $2",
      [TEACHER_CODE_KEY, true]
    );
    if (result.rows.length > 0) expected = result.rows[0].value;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
  if (code !== expected) return res.status(401).json({ error: "invalid code" });
  const exp = Date.now() + TOKEN_TTL_MS;
  res.json({ token: signToken({ exp }), expiresAt: exp });
});

// GET /kv/:key?shared=true
app.get("/kv/:key", async (req, res) => {
  const shared = req.query.shared === "true";
  try {
    const result = await pool.query(
      "SELECT key, value, shared FROM kv_store WHERE key = $1 AND shared = $2",
      [req.params.key, shared]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// PUT /kv/:key  body: { value: string, shared: boolean }
app.put("/kv/:key", requireAuth, async (req, res) => {
  const { value, shared = false } = req.body || {};
  if (typeof value !== "string") return res.status(400).json({ error: "value must be a string" });
  try {
    await pool.query(
      `INSERT INTO kv_store (key, shared, value, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (key, shared) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [req.params.key, shared, value]
    );
    res.json({ key: req.params.key, value, shared });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// DELETE /kv/:key?shared=true
app.delete("/kv/:key", requireAuth, async (req, res) => {
  const shared = req.query.shared === "true";
  try {
    const result = await pool.query(
      "DELETE FROM kv_store WHERE key = $1 AND shared = $2",
      [req.params.key, shared]
    );
    res.json({ key: req.params.key, deleted: result.rowCount > 0, shared });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// GET /kv?prefix=foo&shared=true
app.get("/kv", async (req, res) => {
  const shared = req.query.shared === "true";
  const prefix = req.query.prefix || "";
  try {
    const result = await pool.query(
      "SELECT key FROM kv_store WHERE shared = $1 AND key LIKE $2",
      [shared, `${prefix}%`]
    );
    res.json({ keys: result.rows.map((r) => r.key), prefix, shared });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

const PORT = process.env.PORT || 3001;

ensureTable()
  .then(() => {
    app.listen(PORT, () => console.log(`NxtGen Sandoval Events API listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to set up database table:", err);
    process.exit(1);
  });
