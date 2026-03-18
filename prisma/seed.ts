/**
 * TrainerX 数据库种子脚本
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始生成测试数据...\n');

  // 1. 清理旧数据
  console.log('🧹 清理旧数据...');
  await prisma.checkin.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.course.deleteMany();
  await prisma.coachSchedule.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.userCoach.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ 清理完成\n');

  // 2. 创建用户
  console.log('👥 创建用户...');
  const coachUser = await prisma.user.create({
    data: {
      nickname: '测试教练 - 张三',
      phone: '13800138001',
      avatar: 'https://picsum.photos/seed/coach1/200/200',
      gender: 1,
      role: 2,
      openid: 'test_openid_coach_zhang',
      status: 1,
    },
  });
  console.log(`  ✓ 教练：${coachUser.nickname}`);

  const student1 = await prisma.user.create({
    data: {
      nickname: '测试学员 - 小明',
      phone: '13800138002',
      avatar: 'https://picsum.photos/seed/student1/200/200',
      gender: 1,
      role: 1,
      goal: '减脂',
      openid: 'test_openid_student_1',
      status: 1,
    },
  });
  console.log(`  ✓ 学员：${student1.nickname}`);

  const student2 = await prisma.user.create({
    data: {
      nickname: '测试学员 - 小红',
      phone: '13800138003',
      avatar: 'https://picsum.photos/seed/student2/200/200',
      gender: 2,
      role: 1,
      goal: '塑形',
      openid: 'test_openid_student_2',
      status: 1,
    },
  });
  console.log(`  ✓ 学员：${student2.nickname}`);

  const student3 = await prisma.user.create({
    data: {
      nickname: '测试学员 - 小刚',
      phone: '13800138004',
      avatar: 'https://picsum.photos/seed/student3/200/200',
      gender: 1,
      role: 1,
      goal: '增肌',
      openid: 'test_openid_student_3',
      status: 1,
    },
  });
  console.log(`  ✓ 学员：${student3.nickname}`);

  console.log('');

  // 3. 创建教练
  console.log('🎓 创建教练资料...');
  const coach = await prisma.coach.create({
    data: {
      userId: coachUser.id,
      name: coachUser.nickname,
      specialty: '减脂塑形',
      description: '5 年健身教练经验，擅长减脂和塑形训练',
      experience: 5,
      price: 300,
      rating: 4.9,
      status: 1,
    },
  });
  console.log(`  ✓ 教练：${coach.name} (ID: ${coach.id})\n`);

  // 4. 创建课程
  console.log('📚 创建课程...');
  const course1 = await prisma.course.create({
    data: {
      name: '减脂私教课',
      type: 1,
      duration: 60,
      price: 300,
      description: '一对一减脂训练',
      cover: 'https://picsum.photos/seed/course1/300/200',
      coachId: coach.id,
      status: 1,
    },
  });
  console.log(`  ✓ ${course1.name}`);

  const course2 = await prisma.course.create({
    data: {
      name: '增肌训练课',
      type: 1,
      duration: 60,
      price: 350,
      description: '科学增肌训练',
      cover: 'https://picsum.photos/seed/course2/300/200',
      coachId: coach.id,
      status: 1,
    },
  });
  console.log(`  ✓ ${course2.name}`);

  const course3 = await prisma.course.create({
    data: {
      name: '塑形瑜伽课',
      type: 2,
      duration: 90,
      price: 150,
      description: '瑜伽塑形',
      cover: 'https://picsum.photos/seed/course3/300/200',
      coachId: coach.id,
      status: 1,
    },
  });
  console.log(`  ✓ ${course3.name}`);

  const course4 = await prisma.course.create({
    data: {
      name: 'HIIT 燃脂课',
      type: 2,
      duration: 45,
      price: 120,
      description: '高强度间歇训练',
      cover: 'https://picsum.photos/seed/course4/300/200',
      coachId: coach.id,
      status: 1,
    },
  });
  console.log(`  ✓ ${course4.name}`);

  console.log('');

  // 5. 创建预约
  console.log('📅 创建预约记录...');
  const now = new Date();

  // 今天的课程
  const today10 = new Date(now);
  today10.setHours(10, 0, 0, 0);
  const today11 = new Date(now);
  today11.setHours(11, 0, 0, 0);

  const today14 = new Date(now);
  today14.setHours(14, 0, 0, 0);
  const today1530 = new Date(now);
  today1530.setHours(15, 30, 0, 0);

  const today16 = new Date(now);
  today16.setHours(16, 0, 0, 0);
  const today17 = new Date(now);
  today17.setHours(17, 0, 0, 0);

  await prisma.booking.create({
    data: {
      userId: student1.id,
      coachId: coach.id,
      courseId: course1.id,
      startTime: today10,
      endTime: today11,
      status: 0,
      note: '第一次私教课',
      totalPrice: 300,
      paidAmount: 0,
    },
  });
  console.log('  ✓ 小明 - 减脂私教课 (今天 10:00, 待确认)');

  await prisma.booking.create({
    data: {
      userId: student2.id,
      coachId: coach.id,
      courseId: course3.id,
      startTime: today14,
      endTime: today1530,
      status: 1,
      note: '瑜伽塑形课',
      totalPrice: 150,
      paidAmount: 150,
    },
  });
  console.log('  ✓ 小红 - 塑形瑜伽课 (今天 14:00, 已确认)');

  await prisma.booking.create({
    data: {
      userId: student3.id,
      coachId: coach.id,
      courseId: course2.id,
      startTime: today16,
      endTime: today17,
      status: 1,
      note: '增肌训练',
      totalPrice: 350,
      paidAmount: 350,
    },
  });
  console.log('  ✓ 小刚 - 增肌训练课 (今天 16:00, 已确认)');

  // 已完成的课程
  const past1 = new Date(now);
  past1.setDate(past1.getDate() - 3);
  past1.setHours(10, 0, 0, 0);
  const past1End = new Date(past1);
  past1End.setHours(11, 0, 0, 0);

  await prisma.booking.create({
    data: {
      userId: student1.id,
      coachId: coach.id,
      courseId: course1.id,
      startTime: past1,
      endTime: past1End,
      status: 2,
      note: '已完成',
      totalPrice: 300,
      paidAmount: 300,
    },
  });
  console.log('  ✓ 小明 - 减脂私教课 (3 天前，已完成)');

  console.log('');

  // 6. 创建打卡
  console.log('✅ 创建打卡记录...');
  await prisma.checkin.create({
    data: {
      userId: student1.id,
      type: 1,
      content: '今天完成了第一次私教课，感觉很好！',
      images: 'https://picsum.photos/seed/checkin1/400/300',
      calories: 350,
      duration: 60,
    },
  });
  console.log('  ✓ 小明打卡');

  await prisma.checkin.create({
    data: {
      userId: student2.id,
      type: 1,
      content: '瑜伽课很舒服，身体拉伸开了',
      images: 'https://picsum.photos/seed/checkin2/400/300',
      calories: 200,
      duration: 90,
    },
  });
  console.log('  ✓ 小红打卡');

  console.log('');

  // 7. 创建教练时间表
  console.log('📆 创建教练时间表...');
  const schedules = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
    { dayOfWeek: 1, startTime: '14:00', endTime: '18:00' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '12:00' },
    { dayOfWeek: 2, startTime: '14:00', endTime: '18:00' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' },
    { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '12:00' },
    { dayOfWeek: 4, startTime: '14:00', endTime: '18:00' },
    { dayOfWeek: 5, startTime: '09:00', endTime: '12:00' },
    { dayOfWeek: 5, startTime: '14:00', endTime: '18:00' },
  ];

  for (const s of schedules) {
    await prisma.coachSchedule.create({
      data: {
        coachId: coach.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isAvailable: true,
      },
    });
  }
  console.log(`  ✓ 创建 ${schedules.length} 个时间段\n`);

  // 打印总结
  console.log('========================================');
  console.log('✅ 测试数据生成完成！');
  console.log('========================================\n');
  console.log('📱 测试账号:\n');
  console.log('教练账号:');
  console.log(`  姓名：${coachUser.nickname}`);
  console.log(`  手机：${coachUser.phone}`);
  console.log(`  OpenID: ${coachUser.openid}\n`);

  console.log('学员账号:');
  console.log(`  小明：${student1.phone} (OpenID: ${student1.openid})`);
  console.log(`  小红：${student2.phone} (OpenID: ${student2.openid})`);
  console.log(`  小刚：${student3.phone} (OpenID: ${student3.openid})\n`);

  console.log('📊 数据统计:');
  console.log('  用户：4 (1 教练 +3 学员)');
  console.log('  课程：4');
  console.log('  预约：5');
  console.log('  打卡：2');
  console.log('  时间段：10');
  console.log('\n========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
