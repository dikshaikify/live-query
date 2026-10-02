# Live Query Filter System

Search and filter a 250-item learning catalog with **debounced** API queries, **multi-category** filters and **server-side pagination**.

**Stack:** React (Vite) + Node/Express. No database, so it deploys anywhere (Render, Railway, Vercel).

## Features
- `GET /api/resources` with `search`, `category` (multi), `level` (multi), `minRating`, `sort`, `page`, `limit`
- Debounced search (400 ms) and aborted stale requests, so old responses never overwrite new ones
- Live "API calls made" counter that proves the debounce works
- Category and level checkboxes with live counts (each facet ignores its own filter)
- Pagination with page numbers, page-size selector, skeleton and stale-dim loading states, error retry and empty state
- Filters are stored in the URL, so a filtered view can be shared or refreshed
- 8 unit tests for the search logic: `npm test`

## Run locally
    npm run install:all
    npm run dev          # API on :3000, web on http://localhost:5173
Add `LATENCY_MS=600` as an environment variable to slow the API down and watch the loading states.

## API
    GET /api/resources?search=sec&category=Design&category=Security&level=Advanced&minRating=4&sort=rating&page=2&limit=12
    -> { data: [...], meta: {total,page,limit,totalPages,hasNext,hasPrev}, facets: {category:{...}, level:{...}} }
    GET /api/meta -> { total, categories, levels }

## Deploy
- **Render / Railway:** build `npm install && npm run build`, start `npm start`.
- **Vercel:** import the repo as is; `vercel.json` builds the React app and routes `/api/*` to `api/index.js`.
