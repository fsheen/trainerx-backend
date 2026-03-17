import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService,
  ) {}

  /**
   * 微信登录
   */
  async wxLogin(code: string) {
    const appId = this.configService.get('WECHAT_APP_ID');
    const appSecret = this.configService.get('WECHAT_APP_SECRET');

    console.log('开始微信登录，appId:', appId);
    console.log('微信 code:', code);

    try {
      // 调用微信接口获取 openid
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
      console.log('请求微信 API:', url.replace(appSecret, '***'));
      
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data;
      
      console.log('微信 API 返回:', data);

      // 检查错误
      if (data.errcode) {
        console.error('微信 API 错误:', data.errcode, data.errmsg);
        throw new BadRequestException(data.errmsg || '微信登录失败');
      }

      const { openid, session_key } = data;
      console.log('获取到 openid:', openid);

      // 查询或创建用户
      const user = await this.findOrCreateUser(openid);

      // 生成 JWT token
      const token = this.jwtService.sign({
        openid,
        userId: user.id,
        role: user.role,
        type: 'access',
      });

      // 生成刷新 token
      const refreshToken = this.jwtService.sign({
        openid,
        userId: user.id,
        type: 'refresh',
      }, {
        expiresIn: '30d',
      });

      return {
        token,
        refreshToken,
        expiresIn: 7200, // 2 小时
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('微信登录失败：' + error.message);
    }
  }

  /**
   * 查询或创建用户
   */
  private async findOrCreateUser(openid: string) {
    let user = await this.prisma.user.findUnique({
      where: { openid },
    });

    if (!user) {
      // 创建新用户
      user = await this.prisma.user.create({
        data: {
          openid,
          nickname: `用户_${openid.substring(0, 8)}`,
          gender: 0,
          role: 1, // 默认健身者
          level: 1, // 新手
          status: 1,
        },
      });
    }

    return user;
  }

  /**
   * 更新用户信息
   */
  async updateUserProfile(userId: number, data: {
    nickname?: string;
    avatar?: string;
    gender?: number;
    birthday?: Date;
    height?: number;
    weight?: number;
    goal?: string;
  }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.sanitizeUser(user);
  }

  /**
   * 绑定手机号
   */
  async bindPhone(userId: number, phone: string) {
    // 检查手机号是否已被绑定
    const existing = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existing && existing.id !== userId) {
      throw new BadRequestException('该手机号已被其他账号绑定');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { phone },
    });

    return this.sanitizeUser(user);
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
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        ignoreExpiration: false,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token 类型错误');
      }

      // 生成新的 access token
      const newToken = this.jwtService.sign({
        openid: payload.openid,
        userId: payload.userId,
        role: payload.role,
        type: 'access',
      }, {
        expiresIn: '2h',
      });

      return {
        token: newToken,
        expiresIn: 7200,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token 无效或已过期');
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        coach: true,
        _count: {
          select: {
            bookings: true,
            checkins: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.sanitizeUser(user);
  }

  /**
   * 清理用户敏感信息
   */
  private sanitizeUser(user: any) {
    const { openid, deletedAt, ...result } = user;
    return result;
  }
}
