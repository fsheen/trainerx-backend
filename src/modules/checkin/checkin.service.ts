import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class CheckinService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建打卡
   */
  async createCheckin(userId: number, data: {
    type: number;
    content: string;
    images?: string[];
    duration?: number;
    calories?: number;
    weight?: number;
    mood?: number;
  }) {
    return this.prisma.checkin.create({
      data: {
        userId,
        type: data.type,
        content: data.content,
        images: data.images ? JSON.stringify(data.images) : null,
        duration: data.duration,
        calories: data.calories,
        weight: data.weight,
        mood: data.mood,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * 获取用户的打卡列表
   */
  async getUserCheckins(userId: number, options?: {
    type?: number;
    page?: number;
    pageSize?: number;
  }) {
    const { type, page = 1, pageSize = 20 } = options || {};

    const where: any = { userId };

    if (type !== undefined) {
      where.type = type;
    }

    const [checkins, total] = await Promise.all([
      this.prisma.checkin.findMany({
        where,
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.checkin.count({ where }),
    ]);

    return {
      list: checkins,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取打卡详情
   */
  async getCheckinDetail(checkinId: number) {
    const checkin = await this.prisma.checkin.findUnique({
      where: { id: checkinId },
      include: {
        user: true,
      },
    });

    return checkin;
  }

  /**
   * 获取打卡统计
   */
  async getCheckinStats(userId: number) {
    const [total, trainingCount, dietCount, weightCount] = await Promise.all([
      this.prisma.checkin.count({
        where: { userId },
      }),
      this.prisma.checkin.count({
        where: { userId, type: 1 },
      }),
      this.prisma.checkin.count({
        where: { userId, type: 2 },
      }),
      this.prisma.checkin.count({
        where: { userId, type: 3 },
      }),
    ]);

    // 获取连续打卡天数
    const latestCheckin = await this.prisma.checkin.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      total,
      trainingCount,
      dietCount,
      weightCount,
      latestCheckinAt: latestCheckin?.createdAt,
    };
  }
}
