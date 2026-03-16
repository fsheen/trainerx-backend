import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  /**
   * 微信登录
   */
  async wxLogin(code: string) {
    const appId = this.configService.get('WECHAT_APP_ID');
    const appSecret = this.configService.get('WECHAT_APP_SECRET');

    try {
      // 调用微信接口获取 openid
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
      const { data } = await firstValueFrom(this.httpService.get(url));

      if (data.errcode) {
        throw new BadRequestException(data.errmsg || '微信登录失败');
      }

      const { openid, session_key } = data;

      // TODO: 查询或创建用户
      // const user = await this.findOrCreateUser(openid);

      // 生成 JWT token
      const token = this.jwtService.sign({
        openid,
        type: 'user',
      });

      return {
        token,
        // user,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('微信登录失败');
    }
  }

  /**
   * 验证 Token
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }

  /**
   * 刷新 Token
   */
  async refreshToken(token: string) {
    const payload = await this.validateToken(token);
    
    const newToken = this.jwtService.sign({
      openid: payload.openid,
      type: payload.type,
    });

    return {
      token: newToken,
    };
  }
}
