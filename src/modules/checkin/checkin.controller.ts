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
import { IsInt, IsString, IsOptional, IsArray } from 'class-validator';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class CreateCheckinDto {
  @IsInt()
  type: number;
  
  @IsString()
  content: string;
  
  @IsOptional()
  @IsArray()
  images?: string[];
  
  @IsOptional()
  @IsInt()
  duration?: number;
  
  @IsOptional()
  @IsInt()
  calories?: number;
  
  @IsOptional()
  @IsInt()
  weight?: number;
  
  @IsOptional()
  @IsInt()
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
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const typeNum = type ? parseInt(type) : undefined;
    const pageNum = page ? parseInt(page) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize) : 20;
    const result = await this.checkinService.getUserCheckins(req.user.userId, {
      type: typeNum,
      page: pageNum,
      pageSize: pageSizeNum,
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
