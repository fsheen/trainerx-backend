import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService,
  ) {}

  /**
   * 管理员登录（用户名 + 密码）
   */
  async adminLogin(username: string, password: string) {
    console.log('管理员登录请求:', username);

    // 查找管理员用户
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: username },
          { nickname: username },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查密码（硬编码管理员密码或使用 bcrypt）
    const adminPassword = this.configService.get('ADMIN_PASSWORD', 'admin123');
    
    let passwordValid = false;
    
    // 如果是硬编码密码
    if (password === adminPassword) {
      passwordValid = true;
    } 
    // 如果用户有 password 字段且使用 bcrypt 加密
    else if (user['password'] && user['password'].startsWith('$2')) {
      passwordValid = await bcrypt.compare(password, user['password']);
    }
    // 简单比较（兼容旧数据）
    else if (user['password'] && user['password'] === password) {
      passwordValid = true;
    }

    if (!passwordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查管理员权限（role >= 99）
    if (!user.role || user.role < 99) {
      throw new UnauthorizedException('没有管理员权限');
    }

    // 生成 JWT token
    const token = this.jwtService.sign({
      openid: user.openid || `admin_${user.id}`,
      userId: user.id,
      role: user.role,
      type: 'access',
    });

    // 生成刷新 token
    const refreshToken = this.jwtService.sign({
      openid: user.openid || `admin_${user.id}`,
      userId: user.id,
      type: 'refresh',
    }, {
      expiresIn: '30d',
    });

    return {
      token,
      refreshToken,
      expiresIn: 7200,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * 微信登录
   */
  async wxLogin(code: string, inviteCode?: string) {
    const appId = this.configService.get('WECHAT_APP_ID');
    const appSecret = this.configService.get('WECHAT_APP_SECRET');

    console.log('========================================');
    console.log('开始微信登录');
    console.log('WECHAT_APP_ID:', appId);
    console.log('WECHAT_APP_SECRET:', appSecret ? '***' + appSecret.slice(-4) : 'undefined');
    console.log('微信 code:', code);
    console.log('========================================');

    // 开发环境：支持测试 code
    if (code === 'admin' || code === 'test') {
      console.log('使用测试 code，返回测试 openid');
      const openid = `test_openid_${Date.now()}`;
      
      // 查询或创建用户
      const user = await this.findOrCreateUser(openid);

      // 处理邀请码关联学员
      if (inviteCode) {
        await this.acceptInviteCode(user.id, inviteCode);
      }

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
        expiresIn: 7200,
        user: this.sanitizeUser(user),
      };
    }

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

      // 处理邀请码关联学员
      if (inviteCode) {
        await this.acceptInviteCode(user.id, inviteCode);
      }

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
   * 接受邀请码，关联学员到微信用户
   */
  private async acceptInviteCode(userId: number, inviteCode: string) {
    const student = await this.prisma.student.findUnique({
      where: { inviteCode },
    });

    if (!student) {
      console.warn('邀请码无效:', inviteCode);
      return; // 静默忽略，不影响登录
    }

    if (student.userId) {
      console.warn('学员已被关联:', student.id);
      return;
    }

    // 关联学员到当前微信用户
    await this.prisma.student.update({
      where: { id: student.id },
      data: { userId },
    });

    console.log(`学员 ${student.name}(id=${student.id}) 已关联用户 ${userId}`);
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
