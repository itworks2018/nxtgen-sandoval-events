# NxtGen Sandoval Events

A calendar + announcements board for NxtGen Sandoval. React/Vite frontend,
Express + Postgres backend — meant to be deployed as:

- **Frontend → Vercel** (`/` — the Vite app)
- **Backend → Render** (`/server` — a tiny generic key-value API + Postgres)

Because the app already treats events/announcements as simple JSON blobs
(the same shape as Claude's `window.storage`), the backend just stores
key → value pairs. Nothing in `src/App.jsx` had to change — only
`src/storage-shim.js`, which now calls the Render API instead of the
artifact sandbox.

## 1. Deploy the backend to Render

1. Push this whole repo to GitHub.
2. In Render: **New → Web Service**, connect the repo, set:
   - **Root directory:** `server`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
3. **New → Postgres** (Render's managed Postgres, free tier is fine).
4. On the web service, go to **Environment** and add:
   - `DATABASE_URL` — Render can link this automatically from the Postgres
     instance you just created (there's an "Add from database" option), or
     copy the *External Connection String* from the Postgres dashboard.
   - `ALLOWED_ORIGIN` — leave as `*` for now; come back and set it to your
     real Vercel URL once you have it (e.g.
     `https://nxtgen-sandoval-events.vercel.app`) to lock the API down.
5. Deploy. Once it's live, visit `https://<your-service>.onrender.com/health`
   — you should see `{"ok":true}`. That URL is your API base.

Note: Render's free web services spin down after inactivity and take a few
seconds to wake back up on the next request — the first calendar load after
a quiet period may feel a beat slower. Fine for a church calendar; if that
ever bothers you, upgrade the Render service to a paid instance type.

## 2. Deploy the frontend to Vercel

1. In Vercel: **New Project**, import the same repo.
2. **Root directory:** leave as the repo root (where `package.json`,
   `index.html`, `src/` live — not `server/`).
3. Framework preset: Vite (auto-detected). Defaults are fine
   (Build: `npm run build`, Output: `dist`).
4. Add an environment variable:
   - `VITE_API_BASE_URL` = your Render URL from step 1
     (e.g. `https://nxtgen-sandoval-api.onrender.com`)
5. Deploy.

Now go back to Render and set `ALLOWED_ORIGIN` to your new Vercel URL, then
redeploy the backend so only your site can write to it.

## Local development

Terminal 1 — backend:
```bash
cd server
cp .env.example .env   # fill in a local or Render DATABASE_URL
npm install
npm start
```

Terminal 2 — frontend:
```bash
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:3001
npm install
npm run dev
```

## Default teacher access code

The teacher-mode passcode is `sandoval2026`, set in `src/App.jsx`
(`DEFAULT_CODE`). Change it there before deploying if you want something
less guessable. It's checked client-side, so treat it as a light gate for
casual visitors rather than real security.
