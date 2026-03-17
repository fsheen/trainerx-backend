import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class CreateCheckinDto {
  type: number;
  content: string;
  images?: string[];
  duration?: number;
  calories?: number;
  weight?: number;
  mood?: number;
}

@Controller('checkins')
@UseGuards(JwtAuthGuard)
export class CheckinController {
  constructor(private checkinService: CheckinService) {}

  /**
   * 创建打卡
   */
  @Post()
  async create(@Request() req, @Body() dto: CreateCheckinDto) {
    const checkin = await this.checkinService.createCheckin(req.user.userId, dto);
    return {
      code: 0,
      message: 'success',
      data: checkin,
    };
  }

  /**
   * 获取我的打卡列表
   */
  @Get('my')
  async getMyCheckins(
    @Request() req,
    @Query('type', ParseIntPipe) type?: number,
    @Query('page', ParseIntPipe) page = 1,
    @Query('pageSize', ParseIntPipe) pageSize = 20,
  ) {
    const result = await this.checkinService.getUserCheckins(req.user.userId, {
      type,
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
   * 获取打卡详情
   */
  @Get(':id')
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    const checkin = await this.checkinService.getCheckinDetail(id);
    return {
      code: 0,
      message: 'success',
      data: checkin,
    };
  }

  /**
   * 获取打卡统计
   */
  @Get('stats/overview')
  async getStats(@Request() req) {
    const stats = await this.checkinService.getCheckinStats(req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: stats,
    };
  }
}
