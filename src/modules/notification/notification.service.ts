import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateNotificationDto, ListNotificationsDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建站内消息
   */
  async createNotification(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        content: dto.content,
        type: dto.type,
        templateId: dto.templateId,
        data: dto.data,
      },
    });

    return notification;
  }

  /**
   * 获取用户消息列表
   */
  async getUserNotifications(userId: number, query: ListNotificationsDto) {
    const { page = 1, pageSize = 20, type, isRead } = query;
    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;

    const [list, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取消息详情
   */
  async getNotificationById(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('消息不存在');
    }

    return notification;
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(id: number, userId: number) {
    const notification = await this.getNotificationById(id, userId);

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * 批量标记所有消息为已读
   */
  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { count };
  }

  /**
   * 发送认证结果通知
   */
  async sendCertificationResult(
    userId: number,
    status: number, // 1-通过，2-拒绝
    reason?: string,
  ) {
    const title = '教练认证审核结果';
    const content =
      status === 1
        ? '恭喜您，教练认证已通过！现在可以创建课程并接受学员预约了。'
        : `很抱歉，教练认证未通过。原因：${reason || '详见详情'}`;

    // 创建站内消息
    await this.createNotification({
      userId,
      title,
      content,
      type: 'certification',
      templateId: 'certification_result',
      data: {
        status: status === 1 ? '通过' : '拒绝',
        time: new Date().toLocaleString('zh-CN'),
        reason: reason || '-',
      },
    });

    // TODO: 发送微信模板消息
    // await this.wechatService.sendTemplateMessage({...});
  }

  /**
   * 发送预约确认通知
   */
  async sendBookingConfirmation(
    userId: number,
    coachName: string,
    courseName: string,
    startTime: Date,
  ) {
    const title = '预约确认通知';
    const content = `您预约的 ${coachName} 教练的 ${courseName} 已确认！`;

    await this.createNotification({
      userId,
      title,
      content,
      type: 'booking',
      templateId: 'booking_confirmed',
      data: {
        coach: coachName,
        course: courseName,
        time: startTime.toLocaleString('zh-CN'),
      },
    });
  }

  /**
   * 发送预约取消通知
   */
  async sendBookingCancellation(
    userId: number,
    coachName: string,
    courseName: string,
    reason?: string,
  ) {
    const title = '预约取消通知';
    const content = `您预约的课程已被取消。教练：${coachName}，课程：${courseName}。${reason ? '原因：' + reason : ''}`;

    await this.createNotification({
      userId,
      title,
      content,
      type: 'booking',
      templateId: 'booking_cancelled',
      data: {
        coach: coachName,
        course: courseName,
        reason: reason || '-',
      },
    });
  }
}
