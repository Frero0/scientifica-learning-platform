import { LessonExperience } from "@/features/lesson/LessonExperience";

export const dynamic = "force-dynamic";

type LessonPageProps = {
  params: {
    id: string;
  };
};

export default function LessonPage({ params }: LessonPageProps) {
  return <LessonExperience lessonId={params.id} />;
}
