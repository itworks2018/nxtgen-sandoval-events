// Stand-in for the window.storage API that only exists inside Claude's
// artifact sandbox. This version talks to a small Express + Postgres API
// (see /server) deployed on Render, so data is truly shared across every
// device and browser — not just the one it was entered on.
//
// Set VITE_API_BASE_URL in your Vercel project's environment variables to
// your Render service URL, e.g. https://nxtgen-sandoval-api.onrender.com

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

window.storage = {
  async get(key, shared = false) {
    const res = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}?shared=${shared}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`storage.get failed: ${res.status}`);
    return res.json();
  },

  async set(key, value, shared = false) {
    const res = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, shared }),
    });
    if (!res.ok) throw new Error(`storage.set failed: ${res.status}`);
    return res.json();
  },

  async delete(key, shared = false) {
    const res = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}?shared=${shared}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`storage.delete failed: ${res.status}`);
    return res.json();
  },

  async list(prefix = "", shared = false) {
    const res = await fetch(
      `${API_BASE}/kv?prefix=${encodeURIComponent(prefix)}&shared=${shared}`
    );
    if (!res.ok) throw new Error(`storage.list failed: ${res.status}`);
    return res.json();
  },
};

