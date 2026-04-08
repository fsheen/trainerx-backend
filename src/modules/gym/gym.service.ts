import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateGymDto, UpdateGymDto } from './dto/gym.dto';

@Injectable()
export class GymService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取教练的健身房列表（按收藏和使用次数排序）
   */
  async findAll(coachId: number) {
    return this.prisma.gym.findMany({
      where: {
        coachId,
        deletedAt: null,
      },
      orderBy: [
        { isFavorite: 'desc' }, // 收藏的在前
        { usageCount: 'desc' },  // 使用次数多的在前
      ],
    });
  }

  /**
   * 获取默认健身房（收藏且最近使用 > 最近使用 > 第一个）
   */
  async getDefaultGymId(coachId: number): Promise<number | null> {
    // 优先返回收藏的健身房中最近使用的
    const favoriteGym = await this.prisma.gym.findFirst({
      where: {
        coachId,
        isFavorite: true,
        deletedAt: null,
      },
      orderBy: { lastUsedAt: 'desc' },
    });

    if (favoriteGym) return favoriteGym.id;

    // 其次返回最近使用的健身房
    const recentGym = await this.prisma.gym.findFirst({
      where: {
        coachId,
        deletedAt: null,
      },
      orderBy: { lastUsedAt: 'desc' },
    });

    return recentGym?.id || null;
  }

  /**
   * 创建健身房
   */
  async create(coachId: number, dto: CreateGymDto) {
    return this.prisma.gym.create({
      data: {
        ...dto,
        coachId,
      },
    });
  }

  /**
   * 更新健身房（包括收藏状态）
   */
  async update(id: number, coachId: number, dto: UpdateGymDto) {
    const gym = await this.prisma.gym.findFirst({
      where: { id, coachId, deletedAt: null },
    });

    if (!gym) {
      throw new NotFoundException('健身房不存在');
    }

    return this.prisma.gym.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除健身房
   */
  async remove(id: number, coachId: number) {
    const gym = await this.prisma.gym.findFirst({
      where: { id, coachId, deletedAt: null },
    });

    if (!gym) {
      throw new NotFoundException('健身房不存在');
    }

    return this.prisma.gym.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * 更新健身房使用次数（课程创建后调用）
   */
  async incrementUsage(gymId: number) {
    if (!gymId) return;

    return this.prisma.gym.update({
      where: { id: gymId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }
}
