import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class CoachService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取教练列表
   */
  async getCoaches(options?: {
    specialty?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { specialty, page = 1, pageSize = 20 } = options || {};

    const where: any = {
      status: 1, // 只显示正常状态的教练
    };

    if (specialty) {
      where.specialty = {
        contains: specialty,
      };
    }

    const [coaches, total] = await Promise.all([
      this.prisma.coach.findMany({
        where,
        include: {
          user: true,
          courses: {
            where: { status: 1 },
            take: 3,
          },
          reviews: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { rating: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.coach.count({ where }),
    ]);

    return {
      list: coaches,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取教练详情
   */
  async getCoachDetail(coachId: number) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachId },
      include: {
        user: true,
        courses: {
          where: { status: 1 },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        schedules: true,
      },
    });

    if (!coach) {
      throw new NotFoundException('教练不存在');
    }

    return coach;
  }

  /**
   * 申请成为教练
   */
  async applyToBeCoach(userId: number, data: {
    name: string;
    specialty?: string;
    description?: string;
    experience?: number;
    certificates?: string[];
  }) {
    // 检查是否已经是教练
    const existing = await this.prisma.coach.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('你已经是教练了');
    }

    // 创建教练申请
    return this.prisma.coach.create({
      data: {
        userId,
        name: data.name,
        specialty: data.specialty,
        description: data.description,
        experience: data.experience || 0,
        certificates: data.certificates ? JSON.stringify(data.certificates) : null,
        status: 2, // 审核中
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * 更新教练信息
   */
  async updateCoachProfile(coachId: number, userId: number, data: {
    name?: string;
    specialty?: string;
    description?: string;
    experience?: number;
    certificates?: string[];
    price?: number;
  }) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      throw new NotFoundException('教练信息不存在');
    }

    if (coach.userId !== userId) {
      throw new ForbiddenException('无权修改此教练信息');
    }

    const updateData: any = { ...data };
    if (data.certificates) {
      updateData.certificates = JSON.stringify(data.certificates);
    }

    return this.prisma.coach.update({
      where: { id: coachId },
      data: updateData,
      include: {
        user: true,
      },
    });
  }

  /**
   * 关注教练
   */
  async followCoach(userId: number, coachId: number) {
    // 检查是否已关注
    const existing = await this.prisma.userCoach.findUnique({
      where: { userId },
    });

    if (existing) {
      // 更新关注的教练
      return this.prisma.userCoach.update({
        where: { id: existing.id },
        data: { coachId },
      });
    }

    // 创建新的关注关系
    return this.prisma.userCoach.create({
      data: {
        userId,
        coachId,
      },
    });
  }

  /**
   * 取消关注教练
   */
  async unfollowCoach(userId: number) {
    return this.prisma.userCoach.deleteMany({
      where: { userId },
    });
  }

  /**
   * 获取我关注的教练
   */
  async getFollowedCoaches(userId: number) {
    const userCoach = await this.prisma.userCoach.findUnique({
      where: { userId },
    });

    if (!userCoach) {
      return null;
    }

    const coach = await this.prisma.coach.findUnique({
      where: { id: userCoach.coachId },
      include: {
        user: true,
      },
    });

    return coach;
  }

  /**
   * 设置教练可用时间
   */
  async setSchedule(coachId: number, userId: number, schedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable?: boolean;
  }>) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach || coach.userId !== userId) {
      throw new ForbiddenException('无权设置此教练的日程');
    }

    // 删除旧的时间表
    await this.prisma.coachSchedule.deleteMany({
      where: { coachId },
    });

    // 创建新的时间表
    const created = await this.prisma.coachSchedule.createMany({
      data: schedules.map(s => ({
        coachId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isAvailable: s.isAvailable ?? true,
      })),
    });

    return { count: created.count };
  }

  /**
   * 获取教练时间表
   */
  async getSchedule(coachId: number) {
    return this.prisma.coachSchedule.findMany({
      where: { coachId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }
}
