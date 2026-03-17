import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query, headers } = req;
    
    console.error('========================================');
    console.error(`📩 HTTP 请求：${method} ${originalUrl}`);
    console.error('时间:', new Date().toISOString());
    console.error('Headers:', JSON.stringify(headers, null, 2));
    console.error('Query:', JSON.stringify(query, null, 2));
    console.error('Body:', JSON.stringify(body, null, 2));
    console.error('========================================');

    // 监听响应
    res.on('finish', () => {
      const { statusCode } = res;
      console.error(`📤 HTTP 响应：${method} ${originalUrl} - ${statusCode}`);
    });

    next();
  }
}
