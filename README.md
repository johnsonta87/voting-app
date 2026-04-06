# Team Planning Poker App

A lightweight real-time planning poker app for teams estimating work together.

## Features

- Join with a display name and keep it in local storage.
- Vote with planning cards (`1, 2, 3, 5, 8, 13, 21, ?, ☕`).
- Keep votes hidden until reveal (your own vote is always visible to you).
- Reveal all votes at once and show the average for numeric votes.
- Clear votes or start a new round quickly.
- Real-time sync through Convex.
- Light/dark theme toggle.

## Tech Stack

- React 19 + TypeScript
- Vite
- TanStack Router + React Query
- Convex (backend + real-time data)
- Tailwind CSS 4

## Project Structure

```
src/
  components/    UI building blocks
  hooks/         local room/theme state hooks
  routes/        app routes (main app is routes/index.tsx)
convex/
  schema.ts      Convex data model
  voting.ts      voting queries and mutations
```

## Getting Started

### Prerequisites

- A recent Node.js LTS version
- npm
- A Convex account (for deployment/dev backend)

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

`npm run dev` runs a one-time Convex setup check (`convex dev --once`) and then starts both:

- the Vite web app
- the Convex dev process

## Environment Variables

The app expects:

- `VITE_CONVEX_URL`

This is used in `src/router.tsx` to connect the client to Convex. In normal local development, the Convex CLI sets this up for you.

## Available Scripts

- `npm run dev` - start web + Convex dev processes
- `npm run dev:web` - start only the Vite app
- `npm run dev:convex` - start only Convex dev
- `npm run dev:ts` - run TypeScript compiler in watch mode
- `npm run build` - production build + type check
- `npm run lint` - TypeScript + ESLint checks
- `npm run format` - format files with Prettier

## Data Model (Convex)

- `rooms`
  - `revealed: boolean`
- `votes`
  - `roomId`
  - `voterName`
  - `value` (optional string)

Voting logic lives in `convex/voting.ts` (create room, submit vote, reveal, clear/reset).

## Deploy

- This project includes a `vercel.json` rewrite for SPA routing.
- Build command:

```bash
npm run build
```

Use your preferred hosting provider for the web app, and a Convex deployment for backend data.
