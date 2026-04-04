import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

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
    const coachId = req.user.coachId;
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
    const coachId = req.user.coachId;
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
    const coachId = req.user.coachId;
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
    const coachId = req.user.coachId;
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
    const coachId = req.user.coachId;
    return this.studentService.remove(id, coachId);
  }
}
