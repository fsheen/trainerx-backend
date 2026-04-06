import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  /**
   * 通过 userId 获取教练 ID
   */
  private async getCoachId(userId: number): Promise<number> {
    const coach = await this.prisma.coach.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!coach) {
      throw new ForbiddenException('未找到教练档案');
    }
    return coach.id;
  }

  /**
   * 获取教练的所有学员列表
   */
  async findAll(coachId: number, page: number = 1, limit: number = 20, keyword?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      coachId,
      deletedAt: null,
    };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { phone: { contains: keyword } },
        { goal: { contains: keyword } },
      ];
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          coursePackages: {
            where: { status: 1, deletedAt: null },
            orderBy: { createdAt: 'desc' },
          },
          weightRecords: {
            orderBy: { recordDate: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      list: students.map(s => ({
        ...s,
        remainingSessions: s.coursePackages.reduce((sum, pkg) => sum + pkg.remainingSessions, 0),
        latestWeight: s.weightRecords[0]?.weight || null,
        coursePackages: undefined,
        weightRecords: undefined,
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * 获取学员详情
   */
  async findOne(id: number, coachId: number) {
    const student = await this.prisma.student.findFirst({
      where: { id, coachId, deletedAt: null },
      include: {
        coursePackages: {
          where: { status: 1, deletedAt: null },
          orderBy: { purchaseDate: 'desc' },
        },
        sessions: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        weightRecords: {
          orderBy: { recordDate: 'desc' },
          take: 30,
        },
      },
    });

    if (!student) {
      throw new NotFoundException('学员不存在');
    }

    return {
      ...student,
      remainingSessions: student.coursePackages.reduce((sum, pkg) => sum + pkg.remainingSessions, 0),
      totalSessions: student.coursePackages.reduce((sum, pkg) => sum + pkg.totalSessions, 0),
      usedSessions: student.coursePackages.reduce((sum, pkg) => sum + pkg.usedSessions, 0),
    };
  }

  /**
   * 生成唯一邀请码
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'STU';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * 创建学员
   */
  async create(coachId: number, dto: CreateStudentDto) {
    const inviteCode = this.generateInviteCode();

    const student = await this.prisma.student.create({
      data: {
        ...dto,
        coachId,
        inviteCode,
        birthday: dto.birthday ? new Date(dto.birthday) : null,
      },
    });

    // 更新教练的活跃学员数
    await this.updateCoachActiveStudents(coachId);

    return student;
  }

  /**
   * 更新学员信息
   */
  async update(id: number, coachId: number, dto: UpdateStudentDto) {
    const student = await this.findOne(id, coachId);

    await this.prisma.student.update({
      where: { id },
      data: {
        ...dto,
        birthday: dto.birthday ? new Date(dto.birthday) : null,
      },
    });

    return this.findOne(id, coachId);
  }

  /**
   * 删除学员（软删除）
   */
  async remove(id: number, coachId: number) {
    await this.findOne(id, coachId);

    await this.prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.updateCoachActiveStudents(coachId);

    return { success: true };
  }

  /**
   * 批量导入学员
   */
  async batchImport(coachId: number, students: CreateStudentDto[]) {
    const created = await this.prisma.student.createMany({
      data: students.map(s => ({
        ...s,
        coachId,
        birthday: s.birthday ? new Date(s.birthday) : null,
      })),
    });

    await this.updateCoachActiveStudents(coachId);

    return { count: created.count };
  }

  /**
   * 更新教练的活跃学员数
   */
  private async updateCoachActiveStudents(coachId: number) {
    const count = await this.prisma.student.count({
      where: { coachId, status: 1, deletedAt: null },
    });

    await this.prisma.coach.update({
      where: { id: coachId },
      data: { activeStudents: count },
    });
  }
}
