import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  /**
   * 获取学员列表
   */
  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
  ) {
    const coachId = await this.studentService.getCoachId(req.user.userId);
    return this.studentService.findAll(coachId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20, keyword);
  }

  /**
   * 获取学员详情
   */
  @Get(':id')
  async findOne(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const coachId = await this.studentService.getCoachId(req.user.userId);
    return this.studentService.findOne(id, coachId);
  }

  /**
   * 创建学员
   */
  @Post()
  async create(
    @Request() req: any,
    @Body() dto: CreateStudentDto,
  ) {
    const coachId = await this.studentService.getCoachId(req.user.userId);
    return this.studentService.create(coachId, dto);
  }

  /**
   * 更新学员
   */
  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ) {
    const coachId = await this.studentService.getCoachId(req.user.userId);
    return this.studentService.update(id, coachId, dto);
  }

  /**
   * 删除学员
   */
  @Delete(':id')
  async remove(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const coachId = await this.studentService.getCoachId(req.user.userId);
    return this.studentService.remove(id, coachId);
  }

  // ===== 以下为公开接口，不需要 JWT 认证 =====

  /**
   * 学员通过邀请码关联微信（公开接口）
   */
  @Post('wechat/link')
  @Public()
  async linkWechat(
    @Body() body: { inviteCode: string; wechatOpenId: string; wechatUnionId?: string; phone?: string },
  ) {
    return this.studentService.linkStudentToWechat(
      body.inviteCode,
      body.wechatOpenId,
      body.wechatUnionId,
      body.phone,
    );
  }

  /**
   * 查询学员关联的所有教练（公开接口）
   */
  @Post('wechat/coaches')
  @Public()
  async getCoachesByOpenId(
    @Body() body: { wechatOpenId: string },
  ) {
    return this.studentService.getStudentCoachesByOpenId(body.wechatOpenId);
  }
}
