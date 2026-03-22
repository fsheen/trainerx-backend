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
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { specialty, keyword, page = 1, pageSize = 20 } = options || {};
    console.log('getCoaches called with:', { specialty, keyword, page, pageSize });

    const where: any = {
      status: 1, // 只显示正常状态的教练
    };

    // 专长筛选
    if (specialty) {
      where.specialty = {
        contains: specialty,
      };
    }

    // 关键词搜索（支持名称、专长、描述）
    if (keyword && keyword.trim()) {
      where.OR = [
        {
          name: {
            contains: keyword.trim(),
          },
        },
        {
          specialty: {
            contains: keyword.trim(),
          },
        },
        {
          description: {
            contains: keyword.trim(),
          },
        },
      ];
    }
    console.log('getCoaches where:', JSON.stringify(where));

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
    console.log('getCoaches result:', { total, count: coaches.length });

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

  /**
   * 获取教练的学员列表
   */
  async getMyStudents(coachId: number, options?: {
    page?: number;
    pageSize?: number;
    status?: number;
  }) {
    const { page = 1, pageSize = 20, status } = options || {};

    // 获取教练的预约记录，统计学员信息
    const bookings = await this.prisma.booking.findMany({
      where: {
        coachId,
        ...(status !== undefined && status !== 0 ? { status } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            phone: true,
            gender: true,
            goal: true,
          },
        },
        course: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 按用户分组统计
    const userMap = new Map();
    bookings.forEach(booking => {
      const userId = booking.userId;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: booking.user,
          totalCourses: 0,
          usedCourses: 0,
          status: 1, // 默认进行中
        });
      }
      const userData = userMap.get(userId);
      userData.totalCourses += 1;
      if (booking.status === 2) { // 已完成
        userData.usedCourses += 1;
      }
      if (booking.status === 3) { // 已取消/过期
        userData.status = 3;
      }
    });

    // 转换为列表
    const students = Array.from(userMap.values()).map(data => ({
      ...data.user,
      totalCourses: data.totalCourses,
      usedCourses: data.usedCourses,
      remainingCourses: data.totalCourses - data.usedCourses,
      status: data.status,
    }));

    // 分页
    const total = students.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedStudents = students.slice(startIndex, startIndex + pageSize);

    return {
      list: paginatedStudents,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取教练首页统计数据
   */
  async getHomeStats(coachId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 获取今日预约
    const todayBookings = await this.prisma.booking.findMany({
      where: {
        coachId,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        course: true,
      },
    });

    // 今日数据
    const todayStats = {
      courses: todayBookings.length,
      income: todayBookings.filter(b => b.status === 2).length * 300, // 假设每节课 300 元
      newStudents: todayBookings.filter(b => b.status === 0).length,
    };

    // 今日课程列表
    const todayCourses = todayBookings.map(booking => ({
      id: booking.id,
      studentName: booking.user?.nickname || '学员',
      studentAvatar: booking.user?.avatar || '',
      time: new Date(booking.startTime).getHours().toString().padStart(2, '0') + ':' +
            new Date(booking.startTime).getMinutes().toString().padStart(2, '0'),
      courseName: booking.course?.name || '私教课',
      status: booking.status,
    }));

    // 学员动态（最近的预约和打卡）
    const recentActivities = await this.prisma.booking.findMany({
      where: { coachId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const studentActivities = recentActivities.map((booking, index) => ({
      id: index,
      studentName: booking.user?.nickname || '学员',
      studentAvatar: booking.user?.avatar || '',
      action: booking.status === 0 ? '预约了新课程' :
              booking.status === 1 ? '确认了课程' :
              booking.status === 2 ? '完成了课程' : '取消了课程',
      time: this.formatTimeAgo(booking.createdAt),
    }));

    // 教练信息
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachId },
      include: { user: true },
    });

    const coachInfo = {
      name: coach?.user?.nickname || '教练',
      avatar: coach?.user?.avatar || '',
      title: coach?.specialty || '健身教练',
      rating: coach?.rating || 5.0,
      students: new Set(todayBookings.map(b => b.userId)).size,
      sessions: todayBookings.length,
    };

    return {
      coachInfo,
      todayStats,
      todayCourses,
      studentActivities,
    };
  }

  /**
   * 格式化时间为相对时间
   */
  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(date).toLocaleDateString('zh-CN');
  }
}
