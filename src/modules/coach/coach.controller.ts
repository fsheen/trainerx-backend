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
import { AdminGuard } from '../../common/guards/admin.guard';
import { ApplyCoachDto } from './dto/apply-coach.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ReviewApplicationDto, ListApplicationsDto } from './dto/review-application.dto';

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
    @Query('keyword') keyword?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 20,
  ) {
    const result = await this.coachService.getCoaches({
      specialty,
      keyword,
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
   * 申请成为教练（旧接口，保留向后兼容）
   */
  @Post('apply-old')
  @UseGuards(JwtAuthGuard)
  async apply(@Request() req, @Body() dto: any) {
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
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize) : 20;
    const statusNum = status ? parseInt(status) : undefined;
    const result = await this.coachService.getMyStudents(req.user.userId, {
      page: pageNum,
      pageSize: pageSizeNum,
      status: statusNum,
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

  /**
   * 提交教练认证申请
   */
  @Post('application/submit')
  @UseGuards(JwtAuthGuard)
  async submitApplication(@Request() req, @Body() dto: ApplyCoachDto) {
    const result = await this.coachService.submitApplication(req.user.userId, dto);
    return {
      code: 0,
      message: '申请提交成功',
      data: result,
    };
  }

  /**
   * 查询认证申请状态
   */
  @Get('application/status')
  @UseGuards(JwtAuthGuard)
  async getApplicationStatus(@Request() req) {
    const result = await this.coachService.getApplicationStatus(req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 更新认证申请
   */
  @Put('application')
  @UseGuards(JwtAuthGuard)
  async updateApplication(@Request() req, @Body() dto: UpdateApplicationDto) {
    const result = await this.coachService.updateApplication(req.user.userId, dto);
    return {
      code: 0,
      message: '更新成功',
      data: result,
    };
  }

  /**
   * 撤回认证申请
   */
  @Post('application/withdraw')
  @UseGuards(JwtAuthGuard)
  async withdrawApplication(@Request() req) {
    await this.coachService.withdrawApplication(req.user.userId);
    return {
      code: 0,
      message: '申请已撤回',
      data: null,
    };
  }

  // ==================== 管理员接口 ====================

  /**
   * 获取所有认证申请列表（管理员）
   */
  @Get('admin/applications')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getApplications(
    @Request() req,
    @Query() query: ListApplicationsDto,
  ) {
    const result = await this.coachService.getApplications({
      page: query.page,
      pageSize: query.pageSize,
      status: query.status,
      keyword: query.keyword,
    });
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 获取单个申请详情（管理员）
   */
  @Get('admin/applications/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getApplicationDetail(@Param('id', ParseIntPipe) id: number) {
    const application = await this.coachService.getApplicationDetail(id);
    return {
      code: 0,
      message: 'success',
      data: application,
    };
  }

  /**
   * 审核教练申请（管理员）
   */
  @Post('admin/applications/:id/review')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async reviewApplication(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewApplicationDto,
  ) {
    const result = await this.coachService.reviewApplication(
      id,
      req.user.userId,
      dto,
    );
    return {
      code: 0,
      message: '审核成功',
      data: result,
    };
  }
}
