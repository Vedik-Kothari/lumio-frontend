# Lumio Frontend

Next.js frontend for Lumio, an AI-first video intelligence workspace for ingesting videos, querying indexed content, browsing a library, and exporting grounded answers.

## Product Areas

- Overview landing page
- Ingest flow for uploads and YouTube links
- AI workspace for search, evidence, and playback
- Library browsing for indexed videos
- Dark and light theme support

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

## Local Development

From the `frontend` folder:

```bash
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

## Deployment

This app can be deployed independently to Vercel or any Next.js-compatible host.

Set the production environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain
```

## Suggested Standalone Repo Contents

When splitting into a frontend-only repository, keep:

- `src/`
- `public/`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `.gitignore`
- `README.md`

Do not commit:

- `.env.local`
- `.next/`
- `node_modules/`
- local log files
- `.vercel/`

## Backend Contract

The frontend expects the backend to expose:

- `/api/upload`
- `/api/upload-link`
- `/api/progress/{video_id}`
- `/api/search`
- `/api/workbench`
- `/api/library`
- `/api/video/{video_id}`
