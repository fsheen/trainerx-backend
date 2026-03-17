import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class WxLoginDto {
  code: string;
}

class UpdateProfileDto {
  nickname?: string;
  avatar?: string;
  gender?: number;
  birthday?: Date;
  height?: number;
  weight?: number;
  goal?: string;
}

class BindPhoneDto {
  phone: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 微信登录
   */
  @Post('wx-login')
  @HttpCode(HttpStatus.OK)
  async wxLogin(@Body() dto: WxLoginDto) {
    console.log('收到登录请求，body:', dto);
    console.log('code:', dto?.code);
    
    if (!dto?.code) {
      return {
        code: 400,
        message: '缺少 code 参数',
        data: null,
      };
    }
    
    const result = await this.authService.wxLogin(dto.code);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 刷新 Token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const result = await this.authService.refreshToken(refreshToken);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 获取当前用户信息
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    const user = await this.authService.getCurrentUser(req.user.userId);
    return {
      code: 0,
      message: 'success',
      data: user,
    };
  }

  /**
   * 更新用户资料
   */
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    const user = await this.authService.updateUserProfile(req.user.userId, dto);
    return {
      code: 0,
      message: 'success',
      data: user,
    };
  }

  /**
   * 绑定手机号
   */
  @Post('bind-phone')
  @UseGuards(JwtAuthGuard)
  async bindPhone(@Request() req, @Body() dto: BindPhoneDto) {
    const user = await this.authService.bindPhone(req.user.userId, dto.phone);
    return {
      code: 0,
      message: 'success',
      data: user,
    };
  }

  /**
   * 验证 Token（健康检查）
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body('token') token: string) {
    const payload = await this.authService.validateToken(token);
    return {
      code: 0,
      message: 'success',
      data: { valid: true, payload },
    };
  }

  /**
   * 登出
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    // TODO: 将 token 加入黑名单（使用 Redis）
    return {
      code: 0,
      message: 'success',
      data: { message: '登出成功' },
    };
  }
}
