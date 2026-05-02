# Pearlis — Deployment Guide

Two repos have been created for you on GitHub:

| Repo | Purpose | URL |
|------|---------|-----|
| `pearlis-backend` | Express API + PostgreSQL | https://github.com/aloksingh9667/pearlis-backend |
| `pearlis-frontend` | React + Vite (SPA) | https://github.com/aloksingh9667/pearlis-frontend |

---

## Step 1 — Push the code to GitHub

Run these commands once in the Replit shell (Shell tab):

```bash
# Set up remotes (uses your Personal Access Token)
TOKEN="YOUR_GITHUB_TOKEN"
GITHUB_USERNAME="aloksingh9667"

git remote add pearlis-backend "https://$GITHUB_USERNAME:$TOKEN@github.com/$GITHUB_USERNAME/pearlis-backend.git"
git remote add pearlis-frontend "https://$GITHUB_USERNAME:$TOKEN@github.com/$GITHUB_USERNAME/pearlis-frontend.git"

# Push to both repos
git push pearlis-backend main
git push pearlis-frontend main
```

---

## Step 2 — Deploy the Backend on Render

1. Go to https://render.com and sign in.
2. Click **New → Web Service**.
3. Connect your GitHub account and select **`pearlis-backend`**.
4. Fill in these settings:

| Setting | Value |
|---------|-------|
| **Runtime** | Node |
| **Build Command** | `npm install -g pnpm && pnpm install && pnpm --filter @workspace/api-server run build` |
| **Start Command** | `node artifacts/api-server/dist/index.mjs` |
| **Region** | Singapore (closest to India) |
| **Plan** | Free (or Starter for production) |

5. Click **Advanced → Add Environment Variable** and add these one by one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | A long random string (e.g., from `openssl rand -hex 32`) |
| `MAILGUN_API_KEY` | Your Mailgun API key |
| `MAILGUN_DOMAIN` | Your Mailgun domain |
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret |
| `APP_URL` | Your Cloudflare Pages URL (add after Step 3) |
| `PORT` | `8080` |

6. Click **Create Web Service**.  
7. Note the URL — it will be something like `https://pearlis-api.onrender.com`.

---

## Step 3 — Deploy the Frontend on Cloudflare Pages

1. Go to https://pages.cloudflare.com and sign in.
2. Click **Create a project → Connect to Git**.
3. Select your **`pearlis-frontend`** repository.
4. Fill in these settings:

| Setting | Value |
|---------|-------|
| **Framework preset** | None |
| **Build command** | `npm install -g pnpm && pnpm install && pnpm --filter @workspace/pearlis run build` |
| **Build output directory** | `artifacts/pearlis/dist/public` |

5. Click **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `BASE_PATH` | `/` |
| `NODE_VERSION` | `20` |
| `RENDER_API_URL` | `https://pearlis-api.onrender.com` (from Step 2) |

6. Click **Save and Deploy**.

> **How API calls work:**  
> Your frontend calls `/api/...` → Cloudflare Pages Function (`functions/api/[[path]].js`) intercepts and proxies to your Render backend.  
> No code changes needed — it's all automatic.

---

## Step 4 — Run Database Migrations on Production

After deploying the backend, connect to the Render shell and run:

```bash
# SSH into Render (or use the Render shell)
DATABASE_URL="your-prod-db-url" pnpm --filter @workspace/db run push-force
```

Or set `DATABASE_URL` in your Render environment and trigger a one-off job.

---

## Step 5 — Update CORS in the API Server

In `artifacts/api-server/src/index.ts`, update the `CORS_ORIGIN` to allow your Cloudflare Pages domain:

```ts
const CORS_ORIGIN = process.env.CORS_ORIGIN || "https://pearlis.pages.dev";
```

Add `CORS_ORIGIN` as an environment variable in Render pointing to your Cloudflare Pages URL.

---

## Environment Variables Summary

### Render (Backend)
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<random 64-char string>
PORT=8080
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
APP_URL=https://your-app.pages.dev
CORS_ORIGIN=https://your-app.pages.dev
```

### Cloudflare Pages (Frontend)
```
BASE_PATH=/
NODE_VERSION=20
RENDER_API_URL=https://pearlis-api.onrender.com
```

---

## Custom Domain (Optional)

- **Cloudflare Pages**: Go to your Pages project → **Custom Domains** → Add `www.pearlis.in`
- **Render**: Go to your Web Service → **Custom Domains** → add an A/CNAME record

---

## Keeping Both Repos in Sync

After any code change in Replit, push to both repos:

```bash
git push pearlis-backend main
git push pearlis-frontend main
```

Or, since both point to the same monorepo, you can also push to the original remote:

```bash
git push origin main
git push pearlis-backend main
git push pearlis-frontend main
```
