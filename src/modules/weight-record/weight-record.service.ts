import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto';

@Injectable()
export class WeightRecordService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建体重记录
   */
  async create(coachId: number, studentId: number, dto: CreateWeightRecordDto) {
    // 验证学员属于该教练
    const studentCoach = await this.prisma.studentCoach.findFirst({
      where: {
        studentId: studentId,
        coachId: coachId,
        deletedAt: null,
      },
    });

    if (!studentCoach) {
      throw new NotFoundException('学员不存在或不属于该教练');
    }

    return this.prisma.weightRecord.create({
      data: {
        studentId,
        weight: dto.weight,
        bodyFat: dto.bodyFat,
        muscleMass: dto.muscleMass,
        recordDate: new Date(dto.recordDate),
        note: dto.note,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * 获取学员的体重记录列表
   */
  async findByStudent(studentId: number, coachId: number) {
    // 验证学员属于该教练
    const studentCoach = await this.prisma.studentCoach.findFirst({
      where: {
        studentId: studentId,
        coachId: coachId,
        deletedAt: null,
      },
    });

    if (!studentCoach) {
      throw new NotFoundException('学员不存在或不属于该教练');
    }

    return this.prisma.weightRecord.findMany({
      where: {
        studentId,
        deletedAt: null,
      },
      orderBy: {
        recordDate: 'desc',
      },
      take: 50,
    });
  }

  /**
   * 删除体重记录
   */
  async remove(id: number, coachId: number) {
    const record = await this.prisma.weightRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('记录不存在');
    }

    // 验证权限：检查学员是否属于该教练
    const studentCoach = await this.prisma.studentCoach.findFirst({
      where: {
        studentId: record.studentId,
        coachId: coachId,
        deletedAt: null,
      },
    });

    if (!studentCoach) {
      throw new ForbiddenException('无权操作该记录');
    }

    return this.prisma.weightRecord.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
