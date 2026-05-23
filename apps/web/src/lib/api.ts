import { getApiBaseUrl } from "./env";
import type { CourseDetail, CourseSummary, LessonDetail, UserProgress } from "./types";

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API request failed (${response.status}): ${message}`);
  }

  return response.json() as Promise<T>;
}

export function getCourses(): Promise<CourseSummary[]> {
  return fetchApi<CourseSummary[]>("/courses");
}

export function getCourseBySlug(slug: string): Promise<CourseDetail> {
  return fetchApi<CourseDetail>(`/courses/${slug}`);
}

export function getLessonById(id: string): Promise<LessonDetail> {
  return fetchApi<LessonDetail>(`/lessons/${id}`);
}

export function getUserProgress(userId: string): Promise<UserProgress> {
  return fetchApi<UserProgress>(`/progress/${userId}`);
}
