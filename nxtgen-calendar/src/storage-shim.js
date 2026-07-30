// Stand-in for the window.storage API that only exists inside Claude's
// artifact sandbox. This version talks to a small Express + Postgres API
// (see /server) deployed on Render, so data is truly shared across every
// device and browser — not just the one it was entered on.
//
// Set VITE_API_BASE_URL in your Vercel project's environment variables to
// your Render service URL, e.g. https://nxtgen-sandoval-api.onrender.com

import { supabase } from "./supabaseClient.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Writes (set/delete) require the signed-in teacher's Supabase session token.
async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const headers = data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
  console.log("[storage-shim] authHeaders:", { hasSession: !!data.session, hasToken: !!headers.Authorization });
  return headers;
}

window.storage = {
  async get(key, shared = false) {
    console.log("[storage-shim] GET", { key, shared });
    const res = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}?shared=${shared}`);
    if (res.status === 404) {
      console.log("[storage-shim] GET returned 404 (not found)");
      return null;
    }
    if (!res.ok) {
      console.error("[storage-shim] GET failed", { status: res.status, statusText: res.statusText });
      throw new Error(`storage.get failed: ${res.status}`);
    }
    const data = await res.json();
    console.log("[storage-shim] GET success", { key, valueLength: data?.value?.length });
    return data;
  },

  async set(key, value, shared = false) {
    console.log("[storage-shim] SET START", { key, shared, valueLength: value?.length });
    const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
    const res = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ value, shared }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[storage-shim] SET FAILED", { status: res.status, statusText: res.statusText, errorText });
      throw new Error(`storage.set failed: ${res.status}`);
    }
    const data = await res.json();
    console.log("[storage-shim] SET SUCCESS", { key, shared });
    return data;
  },

  async delete(key, shared = false) {
    const res = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}?shared=${shared}`, {
      method: "DELETE",
      headers: await authHeaders(),
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

