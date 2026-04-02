import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CoursePackageService } from './course-package.service';
import { CreateCoursePackageDto } from './dto/student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('course-packages')
@UseGuards(JwtAuthGuard)
export class CoursePackageController {
  constructor(private readonly packageService: CoursePackageService) {}

  /**
   * 获取学员的课时包列表
   */
  @Get('student/:studentId')
  async findByStudent(
    @Request() req: any,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    const coachId = req.user.coachId;
    return this.packageService.findByStudent(studentId, coachId);
  }

  /**
   * 获取课时包详情
   */
  @Get(':id')
  async findOne(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const coachId = req.user.coachId;
    return this.packageService.findOne(id, coachId);
  }

  /**
   * 创建课时包
   */
  @Post()
  async create(
    @Request() req: any,
    @Body() dto: CreateCoursePackageDto,
  ) {
    const coachId = req.user.coachId;
    return this.packageService.create(coachId, dto);
  }

  /**
   * 更新课时包
   */
  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: {
      courseName?: string;
      price?: number;
      expireDate?: string;
      note?: string;
      status?: number;
    },
  ) {
    const coachId = req.user.coachId;
    return this.packageService.update(id, coachId, dto);
  }

  /**
   * 删除课时包
   */
  @Delete(':id')
  async remove(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const coachId = req.user.coachId;
    return this.packageService.remove(id, coachId);
  }
}
