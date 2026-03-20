import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma/prisma.service';

const JWT_SECRET = process.env.JWT_SECRET || 'trainerx-jwt-secret-key-change-in-production-2026';

describe('CoachModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: any;
  let testCoachId: number;
  let testUserId: number;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
    httpServer = app.getHttpServer();

    prisma = app.get(PrismaService);

    // 创建测试教练和用户
    const user = await prisma.user.create({
      data: {
        openid: 'test_openid_coach_e2e_' + Date.now(),
        nickname: '测试教练',
        avatar: 'https://example.com/coach.png',
        role: 2,
      },
    });
    testUserId = user.id;

    const coach = await prisma.coach.create({
      data: {
        userId: testUserId,
        name: '测试教练',
        specialty: '减脂塑形',
        status: 1,
        rating: 4.9,
      },
    });
    testCoachId = coach.id;

    // 生成 JWT Token（与后端 strategy 一致的 payload 格式）
    authToken = jwt.sign(
      { 
        userId: user.id, 
        openid: user.openid, 
        role: user.role,
        type: 'access'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.course.deleteMany();
    await prisma.coach.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /coaches/home/stats', () => {
    it('获取教练首页统计数据', async () => {
      const response = await request(httpServer)
        .get('/coaches/home/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.code).toBe(0);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /coaches/my/students', () => {
    it('获取教练的学员列表', async () => {
      const response = await request(httpServer)
        .get('/coaches/my/students?page=1&pageSize=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.code).toBe(0);
      expect(response.body.data).toBeDefined();
    });
  });
});
