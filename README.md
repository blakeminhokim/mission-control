# Mission Control Dashboard

A mobile-first web dashboard to monitor your OpenClaw agent's scheduled tasks and token usage.

## Features

- **📅 Calendar View** — Weekly calendar showing scheduled cron jobs
- **📊 Token Tracker** — Monitor token usage and costs
- **📱 Mobile-First** — Responsive design with bottom nav
- **🌙 Dark Theme** — Easy on the eyes

## Setup

### Environment Variables

Set these in Railway (or `.env.local` for local dev):

```bash
# Required: URL of your OpenClaw gateway
OPENCLAW_GATEWAY_URL=https://your-gateway-url.railway.app

# Optional: Auth token if gateway requires it  
OPENCLAW_GATEWAY_TOKEN=your-token
```

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy to Railway

1. Connect this repo to Railway
2. Set `OPENCLAW_GATEWAY_URL` to your Caesar gateway URL
3. Deploy — Railway auto-detects NextJS

## Architecture

```
Mission Control (Railway)
        │
        ▼ HTTP/RPC
┌─────────────────┐
│ OpenClaw Gateway│ (Caesar)
│   /rpc endpoint │
└─────────────────┘
        │
        ▼
  cron.list, sessions.list
```

The dashboard calls your OpenClaw gateway's RPC API:
- `cron.list` — Get scheduled jobs
- `sessions.list` — Get token usage

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── cron/route.ts    # Proxies to gateway RPC
│   │   └── usage/route.ts   # Token usage stats
│   ├── layout.tsx           # Mobile-first layout
│   └── page.tsx             # Calendar + tracker
├── components/
│   ├── Calendar.tsx         # Weekly calendar view
│   ├── JobList.tsx          # Job sidebar
│   ├── TokenTracker.tsx     # Usage stats
│   └── Sidebar.tsx          # Desktop nav
└── lib/
    └── types.ts
```

## Stack

- NextJS 14 (App Router)
- Tailwind CSS
- No database — calls OpenClaw gateway directly

## License

MIT
