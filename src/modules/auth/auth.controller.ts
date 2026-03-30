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
import { IsString, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class WxLoginDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;
  
  @IsString()
  @IsNotEmpty()
  password: string;
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
   * 管理员登录
   */
  @Post('admin-login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() dto: AdminLoginDto) {
    console.log('管理员登录请求:', dto.username);
    
    try {
      const result = await this.authService.adminLogin(dto.username, dto.password);
      return {
        code: 0,
        message: 'success',
        data: result,
      };
    } catch (error) {
      console.error('管理员登录失败:', error.message);
      return {
        code: error.status || 400,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * 微信登录
   */
  @Post('wx-login')
  @HttpCode(HttpStatus.OK)
  async wxLogin(@Body() dto: WxLoginDto) {
    console.error('========================================');
    console.error('收到微信登录请求！');
    console.error('请求体:', JSON.stringify(dto, null, 2));
    console.error('code 值:', dto?.code);
    console.error('========================================');
    
    if (!dto?.code) {
      console.error('错误：缺少 code 参数');
      return {
        code: 400,
        message: ['缺少 code 参数'],
        data: null,
      };
    }
    
    console.error('开始调用 authService.wxLogin...');
    const result = await this.authService.wxLogin(dto.code);
    console.error('登录成功，返回 token');
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
