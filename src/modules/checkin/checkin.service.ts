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

    // 获取总消耗卡路里和总时长
    const checkins = await this.prisma.checkin.findMany({
      where: { userId },
      select: {
        calories: true,
        duration: true,
        createdAt: true,
      },
    });

    const totalCalories = checkins.reduce((sum, c) => sum + (c.calories || 0), 0);
    const totalDuration = checkins.reduce((sum, c) => sum + (c.duration || 0), 0);

    // 计算连续打卡天数
    const streakDays = await this.calculateStreakDays(userId);

    return {
      totalCheckins: total,
      totalCalories,
      totalDuration,
      streakDays,
      trainingCount,
      dietCount,
      weightCount,
    };
  }

  /**
   * 计算连续打卡天数
   */
  async calculateStreakDays(userId: number): Promise<number> {
    const checkins = await this.prisma.checkin.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    if (checkins.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastDate = new Date(checkins[0].createdAt);
    lastDate.setHours(0, 0, 0, 0);

    // 如果最后一次打卡不是今天或昨天，连续天数为 0
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);
    if (diffDays > 1) return 0;

    for (let i = 1; i < checkins.length; i++) {
      const currentDate = new Date(checkins[i].createdAt);
      currentDate.setHours(0, 0, 0, 0);

      const diff = Math.floor((lastDate.getTime() - currentDate.getTime()) / 86400000);

      if (diff === 1) {
        streak++;
        lastDate = currentDate;
      } else if (diff > 1) {
        break;
      }
      // diff === 0 表示同一天多次打卡，跳过
    }

    return streak;
  }
}
