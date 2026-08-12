# Deploy GRACE AI — Publish & Update Anytime

Deploy the frontend to **Vercel**, the backend to **Render**, and MongoDB to **Atlas**. After the first setup, you can **redeploy anytime** with a git push or a manual GitHub Actions run.

---

## Architecture

```
Vercel (React)  →  Render (Express API)  →  MongoDB Atlas
     ↑                      ↑
  CLIENT_URL            MONGODB_URI
```

---

## 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access (`0.0.0.0/0` for Render).
3. Copy the connection string → `MONGODB_URI`.

**Seed demo data (development only):**

```bash
MONGODB_URI="your-atlas-uri" npm run seed:demo
```

Never run `seed:demo` against production with real citizen data.

---

## 2. Backend — Render

1. Push this repo to GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New Web Service** → connect repo.
3. Use `backend/render.yaml` or set manually:
   - **Root directory:** `backend`
   - **Build:** `npm install && npm run build`
   - **Start:** `npm run start`
4. Set environment variables:

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | 32+ random chars |
| `JWT_REFRESH_SECRET` | 32+ random chars |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | (optional) |
| `GOOGLE_CLIENT_SECRET` | (optional) |
| `GOOGLE_CALLBACK_URL` | `https://your-api.onrender.com/api/auth/google/callback` |

5. Note your API URL: `https://grace-ai-api.onrender.com`

---

## 3. Frontend — Vercel

1. [Vercel Dashboard](https://vercel.com) → **Import** GitHub repo.
2. **Root directory:** `frontend`
3. **Framework:** Vite
4. Environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-api.onrender.com/api` |
| `VITE_API_ORIGIN` | `https://your-api.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | Same as backend (optional) |

5. Deploy. Update Render `CLIENT_URL` to match your Vercel URL.

---

## 4. Google OAuth (production)

In Google Cloud Console → OAuth client:

- **Authorized JavaScript origins:** `https://your-app.vercel.app`
- **Redirect URI:** `https://your-api.onrender.com/api/auth/google/callback`

---

## Update anytime (redeploy)

### Option A — Git push (automatic)

Push to `main` → GitHub Actions runs CI + Vercel deploy (if secrets configured).

```bash
git add .
git commit -m "Update GRACE AI"
git push origin main
```

### Option B — Manual deploy (alter anytime)

1. GitHub → **Actions** → **Deploy GRACE AI**
2. Click **Run workflow**
3. Choose:
   - `verify-only` — build + test only
   - `vercel-preview` — preview deploy
   - `vercel-production` — production deploy

### Option C — Platform dashboards

- **Vercel:** Deployments → Redeploy
- **Render:** Manual Deploy → Deploy latest commit

---

## GitHub Actions secrets (optional auto-deploy)

| Secret | Where to get it |
|--------|-----------------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel project settings |
| `VERCEL_PROJECT_ID` | Vercel project settings |

Backend redeploys automatically on Render when you push to the connected branch.

---

## Pre-deploy check (local)

```bash
npm run deploy:verify
```

Runs full build + backend tests before you push.

---

## Public status page

After deploy, visit `/status` on your frontend for live API health and governance statistics.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Login cookies fail cross-origin | Ensure `CLIENT_URL` matches Vercel URL exactly; cookies use `SameSite=None; Secure` in production |
| CORS errors | Add Vercel URL to Render `CLIENT_URL`; backend allows origins from that env |
| API 503 on Render free tier | Cold start — wait ~30s and retry |
| Google OAuth redirect mismatch | Match callback URL exactly in Google Console |
