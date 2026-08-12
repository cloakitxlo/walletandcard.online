# CyberPanel (UltraHost VPS) Deploy Guide

This app needs **Node.js**, not PHP document root upload.

## 1) Create website in CyberPanel

1. Login CyberPanel → **Websites** → **Create Website**
2. Domain: your domain (example: `cryptocard.yourdomain.com`)
3. Create website (SSL can be enabled after DNS points to VPS)

Point your domain DNS **A record** to your UltraHost VPS IP.

## 2) Upload project via SSH

```bash
ssh root@YOUR_VPS_IP
```

Install Node 20 (if not installed):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
```

Put the project on the server (example path):

```bash
mkdir -p /home/crypto-card
cd /home/crypto-card
```

Upload files (from your Mac):

```bash
# run on your Mac
cd /Users/altmash/Projects/crypto-card
rsync -avz --exclude node_modules --exclude .tools --exclude .git ./ root@YOUR_VPS_IP:/home/crypto-card/
```

Or zip upload in CyberPanel File Manager, then unzip in `/home/crypto-card`.

## 3) Build and start with PM2

On VPS:

```bash
cd /home/crypto-card
npm install
npm run build
```

Edit `ecosystem.config.cjs` and set correct `cwd` path, then:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Check:

```bash
curl http://127.0.0.1:3000/api/health
```

Should return: `{"status":"ok",...}`

## 4) Reverse proxy domain → Node (OpenLiteSpeed)

CyberPanel uses OpenLiteSpeed. Proxy your domain to `127.0.0.1:3000`.

### Option A (recommended): CyberPanel → Rewrite / Context proxy

1. CyberPanel → **Websites** → your domain → **Manage**
2. Open **Rewrite Rules** (or vHost Conf / LiteSpeed config)
3. Add proxy rules so all traffic goes to Node:

```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/\.well-known/
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

If Rewrite proxy is not available, use LiteSpeed **External App + Context**:

- External App:
  - Name: `crypto-card-node`
  - Address: `127.0.0.1:3000`
  - Type: Web Server
- Context `/`:
  - Type: Proxy
  - Handler: `crypto-card-node`

Then restart LiteSpeed:

```bash
systemctl restart lsws
```

## 5) SSL

CyberPanel → your website → **SSL** → **Issue SSL** (Let's Encrypt).

## 6) Verify

Open `https://your-domain.com`  
Login page should load (not blank).

Admin login:
- ID: `admin` or `admin@cryptocard.com`
- Password: `SuperAdmin@2026`

## Useful PM2 commands

```bash
pm2 status
pm2 logs crypto-card
pm2 restart crypto-card
```

## After code updates

```bash
cd /home/crypto-card
# upload new files
npm install
npm run build
pm2 restart crypto-card
```

## Common blank-page causes on CyberPanel

| Mistake | Result |
|--------|--------|
| Uploading only to `public_html` | Blank page |
| Not running `npm run build` | Blank / broken |
| App not running in PM2 | 502 / blank |
| Domain not proxied to port 3000 | Website shows default page or blank |
| DNS not pointing to VPS IP | Site unreachable |
