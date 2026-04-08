import { SetMetadata } from '@nestjs/common';

/**
 * 公开接口装饰器 - 跳过 JWT 认证
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
