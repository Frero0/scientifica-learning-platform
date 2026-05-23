# Content Model

## Course

A course is a complete learning path around a scientific capability. It has a slug, level, estimated duration, modules, and progress records.

## Module

A module groups related lessons under one conceptual milestone. Modules are ordered inside a course.

## Lesson

A lesson introduces one idea, shows a visual model, and contains exercises. Lesson content is stored as structured JSON so the frontend can render visual explanations consistently.

## Exercise

Exercises are the core interaction unit. Supported domain types:

- `multiple_choice`
- `numeric_input`
- `drag_and_drop`
- `interactive_visualization`
- `step_by_step`
- `simulation`

Each exercise stores a prompt, optional options, optional steps, optional visualization metadata, a correct answer, points, and an explanation.

## Exercise Attempt

An attempt stores the submitted answer, evaluation result, score, feedback, user, and exercise. Attempts are append-only learning events.

## Progress

Progress summarizes completed exercises against total exercises for a user, course, and lesson. The first implementation updates progress after each submitted attempt.

## Achievement

Achievements represent meaningful learning milestones, such as a first correct observation or completing a lesson. They are separate from progress so gamification can evolve without changing core completion state.
