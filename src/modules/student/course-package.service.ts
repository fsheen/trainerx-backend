import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateCoursePackageDto } from './dto/student.dto';

@Injectable()
export class CoursePackageService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取学员的所有课时包
   */
  async findByStudent(studentId: number, coachId: number) {
    const packages = await this.prisma.studentCoursePackage.findMany({
      where: {
        studentId,
        coachId,
        deletedAt: null,
      },
      orderBy: { purchaseDate: 'desc' },
    });

    const totalSessions = packages.reduce((sum, pkg) => sum + pkg.totalSessions, 0);
    const usedSessions = packages.reduce((sum, pkg) => sum + pkg.usedSessions, 0);
    const remainingSessions = packages.reduce((sum, pkg) => sum + pkg.remainingSessions, 0);

    return {
      list: packages,
      summary: {
        totalSessions,
        usedSessions,
        remainingSessions,
      },
    };
  }

  /**
   * 获取课时包详情
   */
  async findOne(id: number, coachId: number) {
    const pkg = await this.prisma.studentCoursePackage.findFirst({
      where: { id, coachId, deletedAt: null },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        sessions: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException('课时包不存在');
    }

    return pkg;
  }

  /**
   * 创建课时包
   */
  async create(coachId: number, dto: CreateCoursePackageDto) {
    console.log('创建课时包 - 输入数据:', {
      coachId,
      dto: {
        ...dto,
        purchaseDate: dto.purchaseDate,
        expireDate: dto.expireDate,
      },
    });

    const purchaseDate = dto.purchaseDate ? new Date(dto.purchaseDate) : new Date();
    const expireDate = dto.expireDate ? new Date(dto.expireDate) : null;

    console.log('创建课时包 - 处理后数据:', {
      studentId: dto.studentId,
      coachId,
      purchaseDate,
      expireDate,
    });

    try {
      const pkg = await this.prisma.studentCoursePackage.create({
        data: {
          coachId,
          studentId: dto.studentId,
          courseName: dto.courseName,
          totalSessions: dto.totalSessions,
          usedSessions: 0,
          remainingSessions: dto.totalSessions,
          price: dto.price,
          purchaseDate,
          expireDate,
          note: dto.note,
          status: 1,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      console.log('创建课时包成功:', pkg.id);
      return pkg;
    } catch (error) {
      console.error('创建课时包失败:', error);
      throw error;
    }
  }

  /**
   * 更新课时包
   */
  async update(id: number, coachId: number, data: {
    courseName?: string;
    price?: number;
    expireDate?: string;
    note?: string;
    status?: number;
  }) {
    const pkg = await this.findOne(id, coachId);

    const updated = await this.prisma.studentCoursePackage.update({
      where: { id },
      data: {
        ...data,
        expireDate: data.expireDate ? new Date(data.expireDate) : undefined,
      },
    });

    return updated;
  }

  /**
   * 删除课时包（软删除）
   */
  async remove(id: number, coachId: number) {
    await this.findOne(id, coachId);

    await this.prisma.studentCoursePackage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  /**
   * 检查课时包是否有效
   */
  async isValidPackage(id: number, coachId: number): Promise<boolean> {
    const pkg = await this.prisma.studentCoursePackage.findFirst({
      where: { id, coachId, deletedAt: null },
    });

    if (!pkg) return false;
    if (pkg.status !== 1) return false;
    if (pkg.remainingSessions <= 0) return false;
    if (pkg.expireDate && new Date(pkg.expireDate) < new Date()) return false;

    return true;
  }
}
