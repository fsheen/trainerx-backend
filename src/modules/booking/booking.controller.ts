import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class CreateBookingDto {
  coachId: number;
  courseId: number;
  startTime: string;
  endTime: string;
  note?: string;
}

class CancelBookingDto {
  reason?: string;
}

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  /**
   * 创建预约
   */
  @Post()
  async create(@Request() req, @Body() dto: CreateBookingDto) {
    const booking = await this.bookingService.createBooking(req.user.userId, dto);
    return {
      code: 0,
      message: 'success',
      data: booking,
    };
  }

  /**
   * 获取我的预约列表
   */
  @Get('my')
  async getMyBookings(
    @Request() req,
    @Query('status', ParseIntPipe) status?: number,
    @Query('page', ParseIntPipe) page = 1,
    @Query('pageSize', ParseIntPipe) pageSize = 20,
  ) {
    const result = await this.bookingService.getUserBookings(req.user.userId, {
      status,
      page,
      pageSize,
    });
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 获取预约详情
   */
  @Get(':id')
  async getDetail(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const booking = await this.bookingService.getBookingDetail(
      id,
      req.user.userId,
      req.user.role,
    );
    return {
      code: 0,
      message: 'success',
      data: booking,
    };
  }

  /**
   * 取消预约
   */
  @Post(':id/cancel')
  async cancel(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelBookingDto,
  ) {
    const booking = await this.bookingService.cancelBooking(
      id,
      req.user.userId,
      req.user.role,
      dto.reason,
    );
    return {
      code: 0,
      message: 'success',
      data: booking,
    };
  }

  /**
   * 教练确认预约
   */
  @Post(':id/confirm')
  async confirm(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const booking = await this.bookingService.confirmBooking(id, req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: booking,
    };
  }

  /**
   * 教练完成预约
   */
  @Post(':id/complete')
  async complete(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const booking = await this.bookingService.completeBooking(id, req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: booking,
    };
  }

  /**
   * 教练获取预约列表（教练专用）
   */
  @Get('coach/schedule')
  async getCoachSchedule(
    @Request() req,
    @Query('status', ParseIntPipe) status?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('pageSize', ParseIntPipe) pageSize = 20,
  ) {
    const result = await this.bookingService.getCoachBookings(req.user.userId, {
      status,
      startDate,
      endDate,
      page,
      pageSize,
    });
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }
}
