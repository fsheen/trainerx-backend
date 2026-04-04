import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果 controller 已经返回了 {code, message, data} 格式，直接返回不重复包裹
        if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
          return data;
        }
        return {
          code: 200,
          message: 'success',
          data,
          timestamp: Date.now(),
        } as Response<T>;
      }),
    );
  }
}
