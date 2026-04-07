# Lumio Frontend

The Lumio frontend is a Next.js application for ingesting videos, querying indexed content, reviewing evidence, browsing the library, and exporting AI outputs.

## Frontend Features

- Overview page for product entry
- Ingest page for file uploads and video links
- AI workspace with separate answer, evidence, and player views
- Library page for indexed videos
- Theme switching
- Export actions for generated answers
- Quick actions palette
- Interactive UI with motion and layered surfaces

## Pages

- `/`
  overview and product entry
- `/ingest`
  upload files or ingest links
- `/workspace`
  ask questions, run tools, inspect evidence, and play cited moments
- `/library`
  browse indexed videos and open them in context

## UI Capabilities

- Dark and light themes
- Responsive layout
- AI-first workspace structure
- Tool selection for different analysis modes
- Evidence-linked results
- Synced player jumps
- Export as Markdown, text, JSON, HTML, or print/PDF

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide icons

## Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Backend Contract

The frontend expects the backend to provide:

- `/api/upload`
- `/api/upload-link`
- `/api/progress/{video_id}`
- `/api/search`
- `/api/workbench`
- `/api/library`
- `/api/video/{video_id}`

## Main Frontend Areas

### Ingest

- switch between local file and link upload
- live progress indicator
- search-ready and completion states
- jump directly into workspace or library

### Workspace

- choose context: current video, selected video, or library-wide
- switch between workbench modes
- ask natural-language questions
- inspect answer, evidence, and player in separate tabs
- export the active response

### Library

- browse indexed videos
- inspect readiness and metadata
- select a specific video for analysis

## Deployment

Recommended:

- deploy to Vercel
- point `NEXT_PUBLIC_API_URL` to the deployed backend

Production variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain
```

## Do Not Commit

- `.env.local`
- `.next/`
- `node_modules/`
- local logs
- `.vercel/`
