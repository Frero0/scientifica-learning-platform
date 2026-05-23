import { Injectable } from "@nestjs/common";
import type { Prisma } from "@scientifica/db";

import { PrismaService } from "../../common/prisma/prisma.service";

const courseWithPath = {
  modules: {
    orderBy: {
      order: "asc"
    },
    include: {
      lessons: {
        orderBy: {
          order: "asc"
        },
        include: {
          exercises: {
            select: {
              id: true
            }
          }
        }
      }
    }
  }
} satisfies Prisma.CourseInclude;

export type CourseWithPath = Prisma.CourseGetPayload<{
  include: typeof courseWithPath;
}>;

@Injectable()
export class CoursesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<CourseWithPath[]> {
    return this.prisma.course.findMany({
      include: courseWithPath,
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  findBySlug(slug: string): Promise<CourseWithPath | null> {
    return this.prisma.course.findUnique({
      where: {
        slug
      },
      include: courseWithPath
    });
  }
}
