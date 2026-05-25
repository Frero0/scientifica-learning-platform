import { getApiBaseUrl } from "./env";
import type { CoursePathDto, LessonPlayerDto } from "./api-contracts";
import type { CourseDetail, CourseSummary, LessonDetail, UserProgress } from "./types";

type ApiQuery = Record<string, string | undefined>;

export class ApiHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly statusText: string,
    readonly url: string,
    readonly body: string
  ) {
    super(message);
    this.name = "ApiHttpError";
  }
}

export function isApiConnectionError(error: unknown): error is ApiHttpError {
  return error instanceof ApiHttpError && error.status === 0;
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl().replace(/\/$/, "")}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      },
      cache: "no-store"
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown network error";
    throw new ApiHttpError(
      `API request could not reach ${url}. Start the Nest API or check API_BASE_URL. ${detail}`,
      0,
      "Network Error",
      url,
      detail
    );
  }

  if (!response.ok) {
    const body = await response.text();
    const detail = body ? `: ${body}` : "";
    throw new ApiHttpError(
      `API request failed (${response.status} ${response.statusText}) for ${url}${detail}`,
      response.status,
      response.statusText,
      url,
      body
    );
  }

  return response.json() as Promise<T>;
}

function withQuery(path: string, query: ApiQuery = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
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

export function getCoursePath(
  courseId: string,
  options: { userId?: string } = {}
): Promise<CoursePathDto> {
  return fetchApi<CoursePathDto>(
    withQuery(`/courses/${encodeURIComponent(courseId)}/path`, { userId: options.userId })
  );
}

export function getLessonPlayer(
  lessonId: string,
  options: { userId?: string } = {}
): Promise<LessonPlayerDto> {
  return fetchApi<LessonPlayerDto>(
    withQuery(`/lessons/${encodeURIComponent(lessonId)}/player`, { userId: options.userId })
  );
}
