# Architecture

Scientifica is split into apps and packages to keep product surfaces independent from core learning logic.

## Boundaries

`packages/domain` owns framework-agnostic models and exercise evaluation. It must not import Prisma, NestJS, React, or browser APIs.

`packages/db` owns persistence. Prisma models can evolve for database needs, but API services map them into domain or DTO shapes rather than exposing database records directly.

`apps/api` owns application orchestration. Controllers validate and route requests, services coordinate workflows, and repositories isolate Prisma queries.

`apps/web` owns presentation and user interaction. React components do not evaluate answers or update progress directly; they call the API and render returned state.

`packages/ui` owns reusable presentational components. Components accept typed props, expose accessible controls, and avoid product-specific business decisions.

## Request Flow

1. A learner opens a lesson in `apps/web`.
2. Server components load lesson and progress data from `apps/api`.
3. The interactive client component submits an answer to a Next route handler.
4. The route handler forwards the request to the Nest API.
5. The attempts service loads the exercise, calls `evaluateExerciseAttempt` from `packages/domain`, stores the attempt, updates progress, and unlocks achievements.
6. The frontend renders feedback and updated progress.

## Scalability Notes

- Add new exercise types in the domain first, then add API mappers and UI renderers.
- Keep Prisma relations optimized for API use cases through repository-level includes and selects.
- Add background workers later for recommendations, spaced repetition, and content analytics without moving domain logic into the web app.
