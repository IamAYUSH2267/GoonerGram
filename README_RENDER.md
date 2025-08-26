# Deploy to Render with Google OAuth 2.0

This repo has been converted from ReplitAuth to **Google OAuth 2.0** using Passport.

## Environment variables (Render → *Environment*)
- `GOOGLE_CLIENT_ID` – from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` – from Google Cloud Console
- `SESSION_SECRET` – any long random string

## Google Cloud setup (OAuth 2.0)
1. Visit Google Cloud Console → **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Add authorized redirect URI (both for local and Render):
   - Local dev: `http://localhost:8080/api/callback`
   - Render: `https://YOUR-SERVICE.onrender.com/api/callback`
4. Copy the **Client ID** and **Client Secret** into Render’s env vars.

## Render service
- Build command: `npm run build` (if you have one) or leave empty for Vite SSR dev style.
- Start command: `npm start` or `node dist/server/index.js` depending on your setup.
- Port: Render will set `PORT`; the server already reads it via `server/index.ts`.

## Login / Logout endpoints
- Start login: `GET /api/login`
- OAuth callback: `GET /api/callback`
- Logout: `GET /api/logout`
- Current user: `GET /api/auth/user` (protected)

Your client’s **Get Started** button is already wired to `/api/login`.

## Notes
- Sessions use in-memory store (OK for free single instance). For multi-instance, use a shared session store.
- Existing DB schema is unchanged; usernames are auto-generated from Google email and made unique.
