import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateCourseSessionDto, UpdateCourseSessionDto } from './dto/student.dto';

@Injectable()
export class CourseSessionService {
  constructor(private prisma: PrismaService) {}

  /**
   * 通过 userId 获取教练 ID
   */
  private async getCoachId(userId: number): Promise<number> {
    const coach = await this.prisma.coach.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!coach) {
      throw new NotFoundException('教练信息不存在');
    }
    return coach.id;
  }

  /**
   * 获取教练的课程会话列表
   */
  async findAll(userId: number, params: {
    page?: number;
    limit?: number;
    status?: number;
    studentId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const coachId = await this.getCoachId(userId);
    const { page = 1, limit = 20, status, studentId, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      coachId,
      deletedAt: null,
    };

    if (status !== undefined) {
      where.status = status;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    const [sessions, total] = await Promise.all([
      this.prisma.courseSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatar: true,
            },
          },
          package: {
            select: {
              id: true,
              courseName: true,
              remainingSessions: true,
            },
          },
        },
      }),
      this.prisma.courseSession.count({ where }),
    ]);

    return {
      list: sessions,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取今日课程
   */
  async getTodaySessions(userId: number) {
    const coachId = await this.getCoachId(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await this.prisma.courseSession.findMany({
      where: {
        coachId,
        deletedAt: null,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { startTime: 'asc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    // 按状态分组
    const grouped = {
      pending: sessions.filter(s => s.status === 0),
      completed: sessions.filter(s => s.status === 1),
      cancelled: sessions.filter(s => s.status === 2 || s.status === 3),
    };

    return grouped;
  }

  /**
   * 获取学员的课程会话
   */
  async findByStudent(studentId: number, userId: number, page = 1, limit = 20) {
    const coachId = await this.getCoachId(userId);
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this.prisma.courseSession.findMany({
        where: {
          studentId,
          coachId,
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.courseSession.count({
        where: {
          studentId,
          coachId,
          deletedAt: null,
        },
      }),
    ]);

    return {
      list: sessions,
      total,
      page,
      limit,
    };
  }

  /**
   * 创建课程会话
   */
  async create(userId: number, dto: CreateCourseSessionDto) {
    const coachId = await this.getCoachId(userId);
    const startTime = new Date(dto.startTime);
    const endTime = new Date(startTime.getTime() + dto.duration * 60000);

    const session = await this.prisma.courseSession.create({
      data: {
        coachId,
        studentId: dto.studentId,
        packageId: dto.packageId,
        startTime,
        endTime,
        duration: dto.duration,
        courseType: dto.courseType,
        coachNote: dto.note,
        status: 0, // 待上课
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return session;
  }

  /**
   * 更新课程会话
   */
  async update(id: number, userId: number, dto: UpdateCourseSessionDto) {
    const coachId = await this.getCoachId(userId);
    const session = await this.prisma.courseSession.findFirst({
      where: { id, coachId, deletedAt: null },
    });

    if (!session) {
      throw new NotFoundException('课程不存在');
    }

    // 如果状态从未完成变为完成，且未扣课时，则扣课时
    if (dto.status === 1 && session.status !== 1 && !session.isDeducted) {
      dto.isDeducted = true;
      
      // 更新课时包
      if (session.packageId) {
        await this.prisma.studentCoursePackage.update({
          where: { id: session.packageId },
          data: {
            usedSessions: { increment: 1 },
            remainingSessions: { decrement: 1 },
          },
        });
      }
    }

    const updated = await this.prisma.courseSession.update({
      where: { id },
      data: {
        ...dto,
        trainContent: dto.trainContent || null,
        studentState: dto.studentState || null,
        coachNote: dto.coachNote || null,
        images: dto.images || null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * 取消课程
   */
  async cancel(id: number, userId: number, reason: string) {
    return this.update(id, userId, {
      status: 2,
      cancelReason: reason,
    });
  }

  /**
   * 完成课程
   */
  async complete(id: number, userId: number, dto: {
    trainContent?: string;
    studentState?: string;
    coachNote?: string;
    images?: string;
  }) {
    return this.update(id, userId, {
      status: 1,
      ...dto,
      isDeducted: true,
    });
  }

  /**
   * 获取课程会话详情
   */
  async findOne(id: number, userId: number) {
    const coachId = await this.getCoachId(userId);
    const session = await this.prisma.courseSession.findFirst({
      where: { id, coachId, deletedAt: null },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            goal: true,
          },
        },
        package: {
          select: {
            id: true,
            courseName: true,
            remainingSessions: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('课程不存在');
    }

    return session;
  }
}
