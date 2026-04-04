import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户详情
   */
  async getUserDetail(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        coach: {
          include: {
            courses: {
              where: { status: 1 },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 清理敏感信息
    const { openid, deletedAt, ...result } = user;
    return result;
  }

  /**
   * 获取用户统计数据
   */
  async getUserStats(userId: number) {
    const [bookingCount, checkinCount, totalCalories] = await Promise.all([
      this.prisma.booking.count({
        where: { userId, status: { in: [1, 2] } }, // 已确认和已完成
      }),
      this.prisma.checkin.count({
        where: { userId },
      }),
      this.prisma.checkin.aggregate({
        where: { userId },
        _sum: { calories: true },
      }),
    ]);

    return {
      bookingCount,
      checkinCount,
      totalCalories: totalCalories._sum.calories || 0,
    };
  }

  /**
   * 更新用户资料（头像和昵称）
   */
  async updateProfile(userId: number, data: { avatar?: string; nickname?: string }) {
    const updateData: { avatar?: string; nickname?: string } = {};
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.nickname !== undefined) updateData.nickname = data.nickname;

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nickname: true,
        avatar: true,
      },
    });
  }
}
