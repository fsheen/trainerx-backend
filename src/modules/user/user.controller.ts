import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * 获取当前用户信息
   */
  @Get('me')
  async getMe(@Request() req) {
    const user = await this.userService.getUserDetail(req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: user,
    };
  }

  /**
   * 获取用户统计
   */
  @Get('me/stats')
  async getStats(@Request() req) {
    const stats = await this.userService.getUserStats(req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: stats,
    };
  }

  /**
   * 获取用户详情（通过 ID）
   */
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getUserDetail(id);
    return {
      code: 0,
      message: 'success',
      data: user,
    };
  }
}
