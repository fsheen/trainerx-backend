import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CourseSessionService } from './course-session.service';
import { CreateCourseSessionDto, UpdateCourseSessionDto } from './dto/student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('course-sessions')
@UseGuards(JwtAuthGuard)
export class CourseSessionController {
  constructor(private readonly sessionService: CourseSessionService) {}

  /**
   * 获取课程会话列表
   */
  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.userId;
    return this.sessionService.findAll(userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status: status ? parseInt(status) : undefined,
      studentId: studentId ? parseInt(studentId) : undefined,
      startDate,
      endDate,
    });
  }

  /**
   * 获取今日课程
   */
  @Get('dashboard/today')
  async getTodaySessions(@Request() req: any) {
    const userId = req.user.userId;
    return this.sessionService.getTodaySessions(userId);
  }

  /**
   * 获取学员的课程列表
   */
  @Get('student/:studentId')
  async findByStudent(
    @Request() req: any,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const userId = req.user.userId;
    return this.sessionService.findByStudent(studentId, userId, page, limit);
  }

  /**
   * 获取课程详情
   */
  @Get(':id')
  async findOne(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.userId;
    return this.sessionService.findOne(id, userId);
  }

  /**
   * 创建课程
   */
  @Post()
  async create(
    @Request() req: any,
    @Body() dto: CreateCourseSessionDto,
  ) {
    const userId = req.user.userId;
    return this.sessionService.create(userId, dto);
  }

  /**
   * 更新课程
   */
  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseSessionDto,
  ) {
    const userId = req.user.userId;
    return this.sessionService.update(id, userId, dto);
  }

  /**
   * 完成课程
   * 兼容前端字段：content/trainContent, status/studentState, nextSuggestion/coachNote, photos/images
   */
  @Post(':id/complete')
  async complete(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    const userId = req.user.userId;
    // 映射前端字段到后端字段
    const mappedDto = {
      trainContent: dto.content || dto.trainContent,
      studentState: dto.status || dto.studentState,
      coachNote: dto.nextSuggestion || dto.coachNote,
      images: dto.photos ? (Array.isArray(dto.photos) ? JSON.stringify(dto.photos) : dto.photos) : dto.images,
    };
    return this.sessionService.complete(id, userId, mappedDto);
  }

  /**
   * 取消课程
   */
  @Post(':id/cancel')
  async cancel(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ) {
    const userId = req.user.userId;
    return this.sessionService.cancel(id, userId, reason);
  }

  /**
   * 获取本月统计
   */
  @Get('stats/month')
  async getMonthStats(@Request() req: any) {
    const userId = req.user.userId;
    return this.sessionService.getMonthStats(userId);
  }
}
