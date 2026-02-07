# Mission Control Dashboard

A lightweight web dashboard to monitor OpenClaw's scheduled tasks.

## Features

- **Calendar View** - Weekly calendar showing scheduled cron jobs
- **Job List** - All jobs with status indicators
- **Job Details** - Click any event to see full details, errors, payload

## Stack

- NextJS 14 (App Router)
- Tailwind CSS
- No database — direct API proxy to OpenClaw

## Quick Start

```bash
cd /data/workspace/projects/mission-control
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Requirements:**
- OpenClaw gateway must be running locally
- The app calls `openclaw cron list --json` via CLI

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── cron/route.ts    # Proxies to OpenClaw CLI
│   │   └── health/route.ts  # Health check
│   ├── layout.tsx
│   ├── page.tsx             # Calendar view
│   └── globals.css
├── components/
│   ├── Calendar.tsx         # Weekly calendar
│   ├── JobList.tsx          # Sidebar
│   └── Sidebar.tsx          # Navigation
└── lib/
    └── types.ts
```

## Deployment

### Local (Recommended for now)
Run on the same machine as OpenClaw gateway:
```bash
npm run build
npm start
```

### Railway
⚠️ **Requires gateway to be publicly accessible**

The dashboard needs to reach the OpenClaw gateway. Options:
1. Use Tailscale Funnel to expose gateway
2. Deploy alongside OpenClaw on same server
3. Future: WebSocket client for remote gateway access

Railway config included (`railway.json`).

## API Routes

### GET /api/cron
Returns all cron jobs from OpenClaw.

```json
{
  "jobs": [
    {
      "id": "uuid",
      "name": "job-name",
      "enabled": true,
      "scheduleKind": "cron",
      "scheduleExpr": "0 9 * * *",
      "timezone": "Europe/Lisbon",
      "nextRunAtMs": 1234567890000,
      "lastStatus": "ok"
    }
  ]
}
```

### GET /api/health
Health check for Railway deployments.

## Roadmap

- [ ] Remote gateway support (WebSocket client)
- [ ] Activity feed
- [ ] Global search (QMD integration)
- [ ] Cron job management (create/edit/delete)
