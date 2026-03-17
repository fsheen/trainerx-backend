import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './database/prisma/prisma.module';
import { AppPassportModule } from './common/passport/passport.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CoachModule } from './modules/coach/coach.module';
import { BookingModule } from './modules/booking/booking.module';
import { CourseModule } from './modules/course/course.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 频率限制
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 分钟
        limit: 30,  // 最多 30 次请求
      },
    ]),

    // 数据库
    PrismaModule,

    // Passport 认证
    AppPassportModule,

    // 业务模块
    AuthModule,
    UserModule,
    CoachModule,
    BookingModule,
    CourseModule,
    CheckinModule,
    NotificationModule,
  ],
})
export class AppModule {}
