import { LessonExperience } from "@/features/lesson/LessonExperience";

export const dynamic = "force-dynamic";

const demoLessonId = "lesson-observation-hypothesis-evidence";

export default function DemoLessonPage() {
  return <LessonExperience lessonId={demoLessonId} />;
}
