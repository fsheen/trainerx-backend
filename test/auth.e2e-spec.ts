import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma/prisma.service';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
    httpServer = app.getHttpServer();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('Health Check', () => {
    it('应用应该正常启动', async () => {
      expect(app).toBeDefined();
    });
  });

  describe('GET /coaches', () => {
    it('获取教练列表', async () => {
      const response = await request(httpServer)
        .get('/coaches')
        .query({ page: 1, pageSize: 20 })
        .expect(200);

      expect(response.body.code).toBe(0);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /courses', () => {
    it('获取课程列表', async () => {
      const response = await request(httpServer)
        .get('/courses')
        .query({ page: 1, pageSize: 20 })
        .expect(200);

      expect(response.body.code).toBe(0);
      expect(response.body.data).toBeDefined();
    });
  });
});
