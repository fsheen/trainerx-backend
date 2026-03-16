import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

class WxLoginDto {
  code: string;
}

class PhoneLoginDto {
  phone: string;
  code: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('wx-login')
  @HttpCode(HttpStatus.OK)
  async wxLogin(@Body() dto: WxLoginDto) {
    const result = await this.authService.wxLogin(dto.code);
    return result;
  }

  @Post('phone-login')
  @HttpCode(HttpStatus.OK)
  async phoneLogin(@Body() dto: PhoneLoginDto) {
    // TODO: 实现手机号登录
    return { message: 'Not implemented' };
  }

  @Post('send-code')
  @HttpCode(HttpStatus.OK)
  async sendVerifyCode(@Body('phone') phone: string) {
    // TODO: 实现发送验证码
    return { message: '验证码已发送' };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body('token') token: string) {
    const payload = await this.authService.validateToken(token);
    return { valid: true, payload };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('token') token: string) {
    const result = await this.authService.refreshToken(token);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    // TODO: 将 token 加入黑名单
    return { message: '登出成功' };
  }
}
