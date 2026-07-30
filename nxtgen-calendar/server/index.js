import express from "express";
import cors from "cors";
import pg from "pg";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";

const { Pool } = pg;

// ---------- auth: Supabase RLS enforces who's allowed to write ----------
// With Row Level Security enabled in Supabase, only authenticated users can
// write/update/delete. The user's auth token is passed to Supabase, which
// checks `auth.role()` and `auth.uid()` in RLS policies.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL) {
  console.warn("WARNING: SUPABASE_URL not set — authenticated writes will fail.");
}
if (!SUPABASE_ANON_KEY) {
  console.warn("WARNING: SUPABASE_ANON_KEY not set — authenticated writes will fail.");
}
if (!DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL not set — database connection will fail.");
}

// Postgres pool for public reads (bypasses auth, using connection string)
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  
  if (!token) {
    console.error("[requireAuth] No Bearer token provided");
    return res.status(401).json({ error: "unauthorized" });
  }

  // Verify token with Supabase and store it for later use
  try {
    console.log("[requireAuth] Verifying token with Supabase...");
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
    });
    
    if (!resp.ok) {
      console.error("[requireAuth] Supabase auth verification failed:", resp.status, resp.statusText);
      return res.status(401).json({ error: "unauthorized" });
    }
    
    const user = await resp.json();
    console.log("[requireAuth] Token verified for user:", user.id);
    
    // Store token in request for use in route handlers
    req.authToken = token;
    req.userId = user.id;
    next();
  } catch (err) {
    console.error("[requireAuth] Error verifying token:", err.message);
    return res.status(401).json({ error: "unauthorized" });
  }
}

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

app.get("/health", (_req, res) => res.json({ ok: true }));

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
// Token verified by requireAuth; then use direct pool connection (backend is trusted)
app.put("/kv/:key", requireAuth, async (req, res) => {
  const { value, shared = false } = req.body || {};
  if (typeof value !== "string") return res.status(400).json({ error: "value must be a string" });
  
  try {
    console.log("[PUT] Saving to database:", { key: req.params.key, shared, valueLength: value.length });
    
    // Use direct pool connection (already authenticated via requireAuth middleware)
    const result = await pool.query(
      `INSERT INTO kv_store (key, shared, value, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (key, shared) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
       RETURNING key, shared, value`,
      [req.params.key, shared, value]
    );

    if (result.rows.length === 0) {
      console.error("[PUT] No rows returned from database");
      return res.status(500).json({ error: "failed to save" });
    }

    console.log("[PUT] Success:", { key: req.params.key, shared });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("[PUT] Database error:", err.message, err);
    res.status(500).json({ error: "server error" });
  }
});

// DELETE /kv/:key?shared=true
// Token verified by requireAuth; then use direct pool connection (backend is trusted)
app.delete("/kv/:key", requireAuth, async (req, res) => {
  const shared = req.query.shared === "true";
  
  try {
    console.log("[DELETE] Deleting from database:", { key: req.params.key, shared });
    
    // Use direct pool connection (already authenticated via requireAuth middleware)
    const result = await pool.query(
      "DELETE FROM kv_store WHERE key = $1 AND shared = $2",
      [req.params.key, shared]
    );

    console.log("[DELETE] Success:", { key: req.params.key, shared, rowsDeleted: result.rowCount });
    res.json({ key: req.params.key, deleted: result.rowCount > 0, shared });
  } catch (err) {
    console.error("[DELETE] Database error:", err.message, err);
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

// Keep-alive job: periodically query the database to prevent Supabase idle pause
function startKeepAliveJob() {
  setInterval(async () => {
    try {
      await pool.query("SELECT NOW()");
      console.log("[keep-alive] database pinged");
    } catch (err) {
      console.error("[keep-alive] error:", err.message);
    }
  }, 5 * 60 * 1000); // every 5 minutes
}

ensureTable()
  .then(() => {
    startKeepAliveJob();
    app.listen(PORT, () => console.log(`NxtGen Sandoval Events API listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to set up database table:", err);
    process.exit(1);
  });
