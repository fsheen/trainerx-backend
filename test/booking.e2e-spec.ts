import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma/prisma.service';

const JWT_SECRET = process.env.JWT_SECRET || 'trainerx-jwt-secret-key-change-in-production-2026';

describe('BookingModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: any;
  let testCoachId: number;
  let testUserId: number;
  let testCourseId: number;
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

    // 创建测试数据
    const user = await prisma.user.create({
      data: {
        openid: 'test_openid_booking_user_' + Date.now(),
        nickname: '测试用户',
        role: 1,
      },
    });
    testUserId = user.id;

    const coachUser = await prisma.user.create({
      data: {
        openid: 'test_openid_booking_coach_' + Date.now(),
        nickname: '测试教练',
        role: 2,
      },
    });

    const coach = await prisma.coach.create({
      data: {
        userId: coachUser.id,
        name: '测试教练',
        status: 1,
      },
    });
    testCoachId = coach.id;

    const course = await prisma.course.create({
      data: {
        name: '测试预约课程',
        type: 1,
        duration: 60,
        price: 300,
        coachId: testCoachId,
        status: 1,
      },
    });
    testCourseId = course.id;

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

  describe('GET /bookings/my', () => {
    it('获取我的预约列表', async () => {
      const response = await request(httpServer)
        .get('/bookings/my?page=1&pageSize=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.code).toBe(0);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /bookings/coach/schedule', () => {
    it('教练获取预约列表', async () => {
      const response = await request(httpServer)
        .get('/bookings/coach/schedule?page=1&pageSize=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.code).toBe(0);
      expect(response.body.data).toBeDefined();
    });
  });
});
