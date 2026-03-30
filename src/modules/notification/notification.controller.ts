import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ListNotificationsDto } from './dto/create-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /**
   * 获取用户消息列表
   */
  @Get()
  async getNotifications(
    @Request() req,
    @Query() query: ListNotificationsDto,
  ) {
    const result = await this.notificationService.getUserNotifications(
      req.user.userId,
      query,
    );

    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 获取消息详情
   */
  @Get(':id')
  async getNotification(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const notification = await this.notificationService.getNotificationById(
      id,
      req.user.userId,
    );

    return {
      code: 0,
      message: 'success',
      data: notification,
    };
  }

  /**
   * 标记消息为已读
   */
  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.notificationService.markAsRead(id, req.user.userId);

    return {
      code: 0,
      message: 'success',
      data: null,
    };
  }

  /**
   * 批量标记所有消息为已读
   */
  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.userId);

    return {
      code: 0,
      message: 'success',
      data: null,
    };
  }

  /**
   * 获取未读消息数量
   */
  @Get('unread/count')
  async getUnreadCount(@Request() req) {
    const result = await this.notificationService.getUnreadCount(req.user.userId);

    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }
}
