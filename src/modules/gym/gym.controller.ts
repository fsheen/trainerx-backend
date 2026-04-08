import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { GymService } from './gym.service';
import { CreateGymDto, UpdateGymDto } from './dto/gym.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('gyms')
@UseGuards(JwtAuthGuard)
export class GymController {
  constructor(private readonly gymService: GymService) {}

  /**
   * 获取教练的健身房列表
   */
  @Get()
  async findAll(@Request() req: any) {
    const coachId = req.user.coachId;
    return this.gymService.findAll(coachId);
  }

  /**
   * 获取默认健身房 ID
   */
  @Get('default')
  async getDefaultGym(@Request() req: any) {
    const coachId = req.user.coachId;
    const gymId = await this.gymService.getDefaultGymId(coachId);
    return { gymId };
  }

  /**
   * 创建健身房
   */
  @Post()
  async create(@Request() req: any, @Body() dto: CreateGymDto) {
    const coachId = req.user.coachId;
    return this.gymService.create(coachId, dto);
  }

  /**
   * 更新健身房
   */
  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGymDto,
  ) {
    const coachId = req.user.coachId;
    return this.gymService.update(id, coachId, dto);
  }

  /**
   * 删除健身房
   */
  @Delete(':id')
  async remove(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const coachId = req.user.coachId;
    return this.gymService.remove(id, coachId);
  }
}
