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
import { CourseService } from './course.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class CreateCourseDto {
  name: string;
  type: number;
  duration: number;
  price: number;
  description?: string;
  cover?: string;
  maxStudents?: number;
}

class UpdateCourseDto {
  name?: string;
  type?: number;
  duration?: number;
  price?: number;
  description?: string;
  cover?: string;
  maxStudents?: number;
  status?: number;
}

@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  /**
   * 获取课程列表（公开）
   */
  @Get()
  async getList(
    @Query('type') type?: string,
    @Query('coachId') coachId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.courseService.getCourses({
      type: type ? parseInt(type) : undefined,
      coachId: coachId ? parseInt(coachId) : undefined,
      status: status ? parseInt(status) : 1,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 获取课程详情（公开）
   */
  @Get(':id')
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    const course = await this.courseService.getCourseDetail(id);
    return {
      code: 0,
      message: 'success',
      data: course,
    };
  }

  /**
   * 创建课程（教练）
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() dto: CreateCourseDto) {
    const course = await this.courseService.createCourse(req.user.userId, dto);
    return {
      code: 0,
      message: 'success',
      data: course,
    };
  }

  /**
   * 更新课程（教练）
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
  ) {
    const course = await this.courseService.updateCourse(id, req.user.userId, dto);
    return {
      code: 0,
      message: 'success',
      data: course,
    };
  }

  /**
   * 删除课程（教练）
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.courseService.deleteCourse(id, req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: { message: '课程已删除' },
    };
  }
}
