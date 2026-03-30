import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * 管理员权限守卫
 * 检查用户角色是否为管理员（role >= 99）
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('未授权访问');
    }

    // 检查用户角色，管理员角色 >= 99
    // 角色定义：1-普通用户，2-教练，99-管理员
    if (user.role < 99) {
      throw new ForbiddenException('需要管理员权限');
    }

    return true;
  }
}
