# Wallet & Card

Demo crypto debit card dashboard (login, card controls, balances, send/receive, admin).

## Run locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Why hosting shows a blank page

This is **not** a static HTML site. Uploading the project folder (or only `index.html`) to normal shared hosting shows a blank page because:

- `index.html` points to React/TypeScript source (`/src/main.tsx`)
- Login, balances, deposits, and admin need the **Node.js API** (`server.ts`)

You need **Node.js hosting** (not PHP-only / plain file hosting).

## Deploy on your domain (Node hosting)

Works on: **Railway, Render, VPS, DigitalOcean, Hostinger Node.js, cPanel “Setup Node.js App”**, etc.

### 1) Build

```bash
npm install
npm run build
```

This creates `dist/` with:

- `index.html` + `assets/` (frontend)
- `server.cjs` (backend API)

### 2) Start in production

```bash
NODE_ENV=production node dist/server.cjs
```

Or:

```bash
NODE_ENV=production npm start
```

### 3) Hosting settings

| Setting | Value |
|--------|--------|
| Start command | `NODE_ENV=production node dist/server.cjs` |
| Build command | `npm install && npm run build` |
| Port | Use host `PORT` env (app already reads it) |
| Node version | 18+ |

### 4) Point your domain

In your host/DNS:

- Point domain A record / CNAME to the host they give you
- Enable HTTPS (Let’s Encrypt)

### Do NOT

- Upload only `index.html` / `src/` to `public_html`
- Use PHP/static-only hosting for this app
- Forget `NODE_ENV=production`

### Quick test after deploy

Open your domain → login page should load (not blank).  
Admin: `admin` / `SuperAdmin@2026`
