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
} from '@nestjs/common';
import { CoachService } from './coach.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class ApplyCoachDto {
  name: string;
  specialty?: string;
  description?: string;
  experience?: number;
  certificates?: string[];
}

class UpdateCoachDto {
  name?: string;
  specialty?: string;
  description?: string;
  experience?: number;
  certificates?: string[];
  price?: number;
}

class ScheduleDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

@Controller('coaches')
export class CoachController {
  constructor(private coachService: CoachService) {}

  /**
   * 获取教练列表（公开）
   */
  @Get()
  async getList(
    @Query('specialty') specialty?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
  ) {
    const result = await this.coachService.getCoaches({
      specialty,
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
   * 获取教练详情（公开）
   */
  @Get(':id')
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    const coach = await this.coachService.getCoachDetail(id);
    return {
      code: 0,
      message: 'success',
      data: coach,
    };
  }

  /**
   * 申请成为教练
   */
  @Post('apply')
  @UseGuards(JwtAuthGuard)
  async apply(@Request() req, @Body() dto: ApplyCoachDto) {
    const coach = await this.coachService.applyToBeCoach(req.user.userId, dto);
    return {
      code: 0,
      message: 'success',
      data: coach,
    };
  }

  /**
   * 更新教练信息
   */
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() dto: UpdateCoachDto) {
    const coach = await this.coachService.updateCoachProfile(
      req.user.userId,
      req.user.userId,
      dto,
    );
    return {
      code: 0,
      message: 'success',
      data: coach,
    };
  }

  /**
   * 关注教练
   */
  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async follow(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.coachService.followCoach(req.user.userId, id);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 取消关注教练
   */
  @Post('unfollow')
  @UseGuards(JwtAuthGuard)
  async unfollow(@Request() req) {
    await this.coachService.unfollowCoach(req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: { message: '已取消关注' },
    };
  }

  /**
   * 获取我关注的教练
   */
  @Get('my/following')
  @UseGuards(JwtAuthGuard)
  async getFollowing(@Request() req) {
    const coach = await this.coachService.getFollowedCoaches(req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: coach,
    };
  }

  /**
   * 设置教练可用时间
   */
  @Post('schedule')
  @UseGuards(JwtAuthGuard)
  async setSchedule(
    @Request() req,
    @Body() schedules: ScheduleDto[],
  ) {
    const result = await this.coachService.setSchedule(
      req.user.userId,
      req.user.userId,
      schedules,
    );
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 获取教练时间表
   */
  @Get(':id/schedule')
  async getSchedule(@Param('id', ParseIntPipe) id: number) {
    const schedule = await this.coachService.getSchedule(id);
    return {
      code: 0,
      message: 'success',
      data: schedule,
    };
  }

  /**
   * 获取教练的学员列表（教练专用）
   */
  @Get('my/students')
  @UseGuards(JwtAuthGuard)
  async getMyStudents(
    @Request() req,
    @Query('page', ParseIntPipe) page = 1,
    @Query('pageSize', ParseIntPipe) pageSize = 20,
    @Query('status', ParseIntPipe) status?: number,
  ) {
    const result = await this.coachService.getMyStudents(req.user.userId, {
      page,
      pageSize,
      status,
    });
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 获取教练首页统计数据
   */
  @Get('home/stats')
  @UseGuards(JwtAuthGuard)
  async getHomeStats(@Request() req) {
    const stats = await this.coachService.getHomeStats(req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: stats,
    };
  }
}
