import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma/prisma.service';

describe('CheckinModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: any;
  let testUserId: number;
  let authToken: string;
  const JWT_SECRET = process.env.JWT_SECRET || 'trainerx-jwt-secret-key-change-in-production-2026';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
    httpServer = app.getHttpServer();

    prisma = app.get(PrismaService);

    // 创建测试用户
    const user = await prisma.user.create({
      data: {
        openid: 'test_openid_checkin_e2e_' + Date.now(),
        nickname: '测试打卡用户',
        avatar: 'https://example.com/checkin.png',
        role: 1,
      },
    });
    testUserId = user.id;

    // 生成 JWT Token（与后端 strategy 一致的 payload 格式）
    authToken = jwt.sign(
      { 
        userId: user.id, 
        openid: user.openid, 
        role: user.role,
        type: 'access'  // 必需字段
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.checkin.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /checkins', () => {
    it('创建训练打卡', async () => {
      const checkinData = {
        type: 1,
        content: '今天练了胸肌，感觉很好！',
        duration: 60,
        calories: 350,
        mood: 4,
        images: ['https://example.com/image1.jpg'],
      };

      const response = await request(httpServer)
        .post('/checkins')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send(checkinData);

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(0);
    });

    it('创建饮食打卡', async () => {
      const checkinData = {
        type: 2,
        content: '健康午餐',
        calories: 600,
        images: ['https://example.com/food.jpg'],
      };

      const response = await request(httpServer)
        .post('/checkins')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send(checkinData);

      expect(response.status).toBe(201);
      expect(response.body.code).toBe(0);
    });
  });

  describe('GET /checkins/my', () => {
    it('获取我的打卡列表', async () => {
      const response = await request(httpServer)
        .get('/checkins/my?page=1&pageSize=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.code).toBe(0);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /checkins/stats/overview', () => {
    it('获取打卡统计', async () => {
      const response = await request(httpServer)
        .get('/checkins/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.code).toBe(0);
      expect(response.body.data).toHaveProperty('totalCheckins');
    });
  });
});
