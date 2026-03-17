import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3000);
  const nodeEnv = configService.get('NODE_ENV', 'development');

  // 全局前缀
  app.setGlobalPrefix('api');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,  // 暂时禁用，避免验证问题
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger 文档（仅开发环境）
  if (nodeEnv === 'development') {
    const config = new DocumentBuilder()
      .setTitle('TrainerX API')
      .setDescription('TrainerX 健身小程序后端 API 文档')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Sentry 错误监控（生产环境）
  if (nodeEnv === 'production') {
    const sentryDsn = configService.get('SENTRY_DSN');
    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        environment: nodeEnv,
      });
    }
  }

  // 健康检查
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  await app.listen(port);
  console.log(`🚀 TrainerX 服务启动成功：http://localhost:${port}`);
  console.log(`📚 API 文档：http://localhost:${port}/api/docs`);
}
bootstrap();
