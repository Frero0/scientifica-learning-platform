import { Module } from "@nestjs/common";

import { PrismaModule } from "./common/prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { AttemptsModule } from "./modules/attempts/attempts.module";
import { CoursesModule } from "./modules/courses/courses.module";
import { ExercisesModule } from "./modules/exercises/exercises.module";
import { GamificationModule } from "./modules/gamification/gamification.module";
import { LessonsModule } from "./modules/lessons/lessons.module";
import { ProgressModule } from "./modules/progress/progress.module";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    CoursesModule,
    LessonsModule,
    ExercisesModule,
    AttemptsModule,
    ProgressModule,
    GamificationModule
  ]
})
export class AppModule {}
