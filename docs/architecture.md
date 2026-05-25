# Architecture

Scientifica is a pnpm/Turborepo monorepo with a Next.js web app, a NestJS API, a
Prisma/PostgreSQL persistence package, and small shared packages for domain, UI, and
configuration.

This shape is intentionally a little more structured than a single Next.js app because the product
is expected to grow into an interactive learning platform with reusable exercise logic, API
orchestration, data persistence, authoring workflows, and possibly additional clients later.

## Current Decision

Keep the monorepo.

The monorepo is justified for this product because learning models, exercise evaluation, database
access, API orchestration, and UI rendering have different change pressures. Keeping those seams
visible now prevents the web app from becoming the owner of business logic and keeps the domain
portable for tests, background jobs, authoring tools, or future clients.

The risk is overengineering: packages must stay small and useful. Do not add shared packages,
generic abstractions, queues, workers, auth layers, or design-system machinery until a concrete
feature needs them.

## Structure

- `apps/web` - Next.js App Router frontend. Owns routes, layout, server components, client
  interactions, and calls to API-facing route handlers.
- `apps/api` - NestJS REST API. Owns controllers, validation, application services, repositories,
  DTO mapping, and orchestration across persistence and domain logic.
- `packages/domain` - Framework-agnostic learning models and exercise evaluation. Owns pure
  TypeScript logic that must not depend on React, NestJS, Prisma, Node-only APIs, browser APIs, or
  environment variables.
- `packages/db` - Prisma schema, migrations, Prisma client exports, and seed data. Owns persistence
  structure only.
- `packages/ui` - Reusable presentational React components and small UI utilities. Owns UI building
  blocks, not product workflows or data fetching.
- `packages/config` - Shared TypeScript, ESLint, and Prettier configuration.
- `docs` - Product and technical documentation that captures current decisions.

## Dependency Boundaries

Healthy dependencies:

- `apps/web` can depend on `packages/ui` and type-only or model exports from `packages/domain`.
- `apps/api` can depend on `packages/db` and `packages/domain`.
- `packages/db` can depend on Prisma only.
- `packages/ui` can depend on React-compatible UI utilities and must stay presentation-focused.
- `packages/domain` should have no local workspace dependencies.
- `packages/config` should not depend on application code.

Avoid these dependencies:

- `packages/domain` importing Prisma, NestJS, React, browser APIs, or environment variables.
- `apps/web` importing `packages/db` or Prisma directly.
- `packages/ui` importing API clients, Prisma types, product repositories, or learning workflows.
- `packages/db` importing API services, web components, or UI code.
- API controllers returning raw Prisma records when DTOs or domain-facing mappings are needed.

## Runtime Flow

1. A learner opens a route in `apps/web`.
2. Server components or route handlers call the configured API base URL.
3. The Nest API validates requests in controllers.
4. API services coordinate repository reads/writes and domain logic.
5. Repositories isolate Prisma queries and persistence-specific shape.
6. Domain functions such as `evaluateExerciseAttempt` evaluate learning logic without framework
   dependencies.
7. API services persist attempts, progress, and achievements, then return DTOs.
8. Lesson player reads use an explicit boundary:
   `persistence -> domain/application mapper -> API DTO -> future UI renderer`.
9. The frontend renders returned state and does not evaluate answers directly.

The current interactive lesson flow uses a Next route handler as a frontend boundary for attempt
submission, then forwards the request to the Nest API.

## Local Runtime

Local development uses PostgreSQL from Docker Compose and the committed Prisma migrations.

```bash
cp .env.example .env
pnpm install --frozen-lockfile
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Default local endpoints:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Health: `http://localhost:4000/health`

Use `pnpm db:migrate` to apply committed migrations. Use `pnpm db:migrate:dev` only when changing
the Prisma schema and creating a new migration intentionally.

## Quality Gates

Root scripts are the source of truth:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

CI runs on push and pull request. It installs dependencies with a frozen lockfile, starts a
PostgreSQL service container, generates Prisma client code, applies migrations, seeds the database,
then runs tests, lint, typecheck, and build.

Current tests are intentionally small:

- Domain unit tests cover `evaluateExerciseAttempt`.
- API smoke tests verify `/health` and the seeded database-backed path through `/courses`,
  `/courses/:id/path`, `/lessons/:id`, `/lessons/:id/player`, `/attempts`, and
  `/progress/:userId`.

## Product Architecture Principles

- Add learning behavior in `packages/domain` first when it can be expressed as pure logic.
- Add persistence changes in `packages/db` with migrations and keep database records behind API
  repository boundaries.
- Add API workflows in `apps/api` through controllers, services, repositories, schemas, and DTOs.
- Keep API learning mappers pure and isolated: services load Prisma records through repositories,
  then mappers compose stable DTOs such as `CoursePathDto` and `LessonPlayerDto` without fetching
  from the database.
- Add frontend behavior in `apps/web`; keep data fetching and mutation paths explicit.
- Promote UI to `packages/ui` only when it is reusable and presentation-only.
- Prefer focused tests at the package boundary where the behavior lives.
- Keep the monorepo boring: no new package, dependency, or abstraction without a concrete need.
- Use `docs/db-api-learning-mapping.md` as the decision source for mapping
  `Subject -> Course -> Level -> Lesson -> Step` onto current DB/API entities.

## Current Gaps

- API database-backed tests currently cover the seeded happy path only, not validation or error
  cases.
- There is no browser e2e suite.
- Authentication and authorization are not implemented.
- Background jobs, authoring tools, analytics, and AI tutor capabilities are intentionally out of
  scope for the current baseline.
