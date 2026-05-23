# Scientifica Learning Platform

Production-oriented starter for an interactive scientific learning platform. It uses a pnpm/Turborepo monorepo, Next.js App Router, NestJS, Prisma, PostgreSQL, Zod, and shared TypeScript packages.

## Apps And Packages

- `apps/web` - Next.js frontend with course catalog, course detail, and interactive lesson demo.
- `apps/api` - NestJS REST API with courses, lessons, exercises, attempts, progress, gamification, and health modules.
- `packages/domain` - framework-agnostic learning and exercise models plus exercise evaluation logic.
- `packages/db` - Prisma schema, Prisma client setup, and seed data.
- `packages/ui` - reusable Tailwind UI components.
- `packages/config` - shared TypeScript, ESLint, and Prettier config.

## Setup

```bash
cp .env.example .env
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The web app runs at `http://localhost:3000`.
The API runs at `http://localhost:4000`.

## Local Development Commands

```bash
pnpm dev          # run web and API through Turbo
pnpm build        # build all apps and packages
pnpm lint         # lint all workspaces
pnpm typecheck    # run TypeScript checks
pnpm format       # format source, docs, config, and Prisma files
```

## Database Commands

```bash
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

Seeded demo content:

- Course: `Foundations of Scientific Thinking`
- Demo route: `http://localhost:3000/lessons/demo`
- Demo user id: `demo-user`

## Architecture Summary

The frontend does not evaluate exercises. It renders lesson state, sends answers through a Next route handler, and displays the API response.

The Nest API coordinates repositories, domain evaluation, persistence, progress updates, and gamification. Prisma access is isolated in repositories and the shared `PrismaService`.

The domain package has no dependency on React, NestJS, or Prisma. That keeps learning models and exercise evaluation portable for tests, background jobs, authoring tools, or future mobile clients.

## Next Steps

1. Add authentication and replace the seeded `demo-user` with real user context.
2. Add tests for domain exercise evaluation and API attempt submission.
3. Introduce authoring workflows for courses, lessons, and exercise variants.
4. Add richer exercise renderers for drag-and-drop, simulations, and interactive visualizations.
5. Add analytics events for learning progress and misconception patterns.
