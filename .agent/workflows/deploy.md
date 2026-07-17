---
description: Deploy the frontend and backend to the AWS EC2 instance
---

# Deploy to AWS

The app runs on an EC2 instance (`eu-north-1`, Stockholm).
- **Instance ID**: `i-07564444ce6451ce8`
- **Public IP**: `13.50.225.253`
- **Access**: AWS EC2 Instance Connect (browser-based SSH)

## Prerequisites
- Push all changes to GitHub first (both repos)
- Access the EC2 instance via AWS Console → EC2 → Instance Connect

## 1. Deploy Backend (flat-booking-system)

```bash
cd ~/apps/flat-booking-system && git pull && pm2 restart booking-api
```

If `.env` changes were made locally, update them on the server:
```bash
nano ~/apps/flat-booking-system/.env
# Edit the values, then Ctrl+O → Enter → Ctrl+X
pm2 restart booking-api
```

## 2. Deploy Frontend (paraiso-booking-app)

```bash
cd ~/apps/paraiso-booking-app && git pull && npm install && npm run build
```

The frontend is served as static files by Nginx from the `dist/` folder.

## 3. Verify

- Check backend status: `pm2 status`
- Check backend logs: `pm2 logs booking-api --lines 20`
- Check Nginx: `sudo systemctl status nginx`

## Notes
- Backend is managed by **PM2** (process: `booking-api`)
- Frontend is built with **Vite** and served by **Nginx**
- The `.env` file is gitignored — secrets must be updated manually on the server
