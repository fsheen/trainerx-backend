import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取课程列表
   */
  async getCourses(options?: {
    type?: number;
    coachId?: number;
    status?: number;
    page?: number;
    pageSize?: number;
  }) {
    const { type, coachId, status = 1, page = 1, pageSize = 20 } = options || {};

    const where: any = { status };

    if (type !== undefined) {
      where.type = type;
    }

    if (coachId !== undefined) {
      where.coachId = coachId;
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          coach: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      list: courses,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取课程详情
   */
  async getCourseDetail(courseId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        coach: {
          include: {
            user: true,
            reviews: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    return course;
  }

  /**
   * 创建课程（教练）
   */
  async createCourse(coachId: number, data: {
    name: string;
    type: number;
    duration: number;
    price: number;
    description?: string;
    cover?: string;
    maxStudents?: number;
  }) {
    // 验证教练身份
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      throw new ForbiddenException('只有教练可以创建课程');
    }

    return this.prisma.course.create({
      data: {
        ...data,
        coachId,
        maxStudents: data.maxStudents || 1,
        status: 1,
      },
      include: {
        coach: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * 更新课程（教练）
   */
  async updateCourse(courseId: number, coachId: number, data: {
    name?: string;
    type?: number;
    duration?: number;
    price?: number;
    description?: string;
    cover?: string;
    maxStudents?: number;
    status?: number;
  }) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    if (course.coachId !== coachId) {
      throw new ForbiddenException('无权修改此课程');
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data,
      include: {
        coach: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * 删除课程（教练）
   */
  async deleteCourse(courseId: number, coachId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    if (course.coachId !== coachId) {
      throw new ForbiddenException('无权删除此课程');
    }

    // 软删除
    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: 0, // 下架
      },
    });
  }
}
