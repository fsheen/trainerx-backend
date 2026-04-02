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
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status', new ParseIntPipe({ optional: true })) status?: number,
    @Query('studentId', new ParseIntPipe({ optional: true })) studentId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const coachId = req.user.coachId;
    return this.sessionService.findAll(coachId, {
      page,
      limit,
      status,
      studentId,
      startDate,
      endDate,
    });
  }

  /**
   * 获取今日课程
   */
  @Get('dashboard/today')
  async getTodaySessions(@Request() req: any) {
    const coachId = req.user.coachId;
    return this.sessionService.getTodaySessions(coachId);
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
    const coachId = req.user.coachId;
    return this.sessionService.findByStudent(studentId, coachId, page, limit);
  }

  /**
   * 获取课程详情
   */
  @Get(':id')
  async findOne(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const coachId = req.user.coachId;
    return this.sessionService.findOne(id, coachId);
  }

  /**
   * 创建课程
   */
  @Post()
  async create(
    @Request() req: any,
    @Body() dto: CreateCourseSessionDto,
  ) {
    const coachId = req.user.coachId;
    return this.sessionService.create(coachId, dto);
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
    const coachId = req.user.coachId;
    return this.sessionService.update(id, coachId, dto);
  }

  /**
   * 完成课程
   */
  @Post(':id/complete')
  async complete(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: {
      trainContent?: string;
      studentState?: string;
      coachNote?: string;
      images?: string;
    },
  ) {
    const coachId = req.user.coachId;
    return this.sessionService.complete(id, coachId, dto);
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
    const coachId = req.user.coachId;
    return this.sessionService.cancel(id, coachId, reason);
  }
}
