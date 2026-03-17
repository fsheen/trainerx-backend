import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建预约
   */
  async createBooking(userId: number, data: {
    coachId: number;
    courseId: number;
    startTime: string;
    endTime: string;
    note?: string;
  }) {
    const { coachId, courseId, startTime, endTime, note } = data;

    // 验证教练是否存在
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      throw new NotFoundException('教练不存在');
    }

    // 验证课程是否存在
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 检查时间冲突
    const conflict = await this.prisma.booking.findFirst({
      where: {
        coachId,
        status: { in: [0, 1] }, // 待确认或已确认
        OR: [
          {
            startTime: { lte: new Date(startTime) },
            endTime: { gt: new Date(startTime) },
          },
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gte: new Date(endTime) },
          },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException('该时间段已被预约');
    }

    // 创建预约
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        coachId,
        courseId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        note,
        totalPrice: course.price,
        status: 0, // 待确认
      },
      include: {
        coach: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });

    return booking;
  }

  /**
   * 获取用户的预约列表
   */
  async getUserBookings(userId: number, options?: {
    status?: number;
    page?: number;
    pageSize?: number;
  }) {
    const { status, page = 1, pageSize = 20 } = options || {};

    const where: any = { userId };

    if (status !== undefined) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          coach: {
            include: {
              user: true,
            },
          },
          course: true,
        },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      list: bookings,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取教练的预约列表
   */
  async getCoachBookings(coachId: number, options?: {
    status?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { status, startDate, endDate, page = 1, pageSize = 20 } = options || {};

    const where: any = { coachId };

    if (status !== undefined) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          user: true,
          course: true,
        },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      list: bookings,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取预约详情
   */
  async getBookingDetail(bookingId: number, userId: number, role: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        coach: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('预约不存在');
    }

    // 权限检查
    if (booking.userId !== userId && booking.coachId !== userId) {
      throw new ForbiddenException('无权查看此预约');
    }

    return booking;
  }

  /**
   * 教练确认预约
   */
  async confirmBooking(bookingId: number, coachId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('预约不存在');
    }

    if (booking.coachId !== coachId) {
      throw new ForbiddenException('无权操作此预约');
    }

    if (booking.status !== 0) {
      throw new BadRequestException('预约状态不允许确认');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 1 }, // 已确认
      include: {
        coach: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });
  }

  /**
   * 取消预约
   */
  async cancelBooking(bookingId: number, userId: number, role: number, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('预约不存在');
    }

    // 只有用户可以取消待确认的预约，或教练可以取消
    if (role === 1 && booking.userId !== userId) {
      // 健身者只能取消自己的预约
      throw new ForbiddenException('无权取消此预约');
    }

    if (booking.status === 2) {
      throw new BadRequestException('已完成的预约不能取消');
    }

    if (booking.status === 3) {
      throw new BadRequestException('预约已取消');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 3, // 已取消
        cancelReason: reason,
      },
      include: {
        coach: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });
  }

  /**
   * 完成预约（教练操作）
   */
  async completeBooking(bookingId: number, coachId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('预约不存在');
    }

    if (booking.coachId !== coachId) {
      throw new ForbiddenException('无权操作此预约');
    }

    if (booking.status !== 1) {
      throw new BadRequestException('只有已确认的预约可以完成');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 2 }, // 已完成
    });
  }
}
