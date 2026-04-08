import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { WeightRecordService } from './weight-record.service';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('weight-records')
@UseGuards(JwtAuthGuard)
export class WeightRecordController {
  constructor(private readonly weightRecordService: WeightRecordService) {}

  /**
   * 创建体重记录
   */
  @Post()
  async create(
    @Request() req: any,
    @Body() dto: CreateWeightRecordDto,
  ) {
    const coachId = req.user.coachId;
    return this.weightRecordService.create(coachId, dto.studentId, dto);
  }

  /**
   * 获取学员的体重记录列表
   */
  @Get('student/:studentId')
  async findByStudent(
    @Request() req: any,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    const coachId = req.user.coachId;
    return this.weightRecordService.findByStudent(studentId, coachId);
  }

  /**
   * 删除体重记录
   */
  @Delete(':id')
  async remove(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const coachId = req.user.coachId;
    return this.weightRecordService.remove(id, coachId);
  }
}
