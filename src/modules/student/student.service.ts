import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  /**
   * 通过 userId 获取教练 ID
   */
  public async getCoachId(userId: number): Promise<number> {
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
   * 获取教练的所有学员列表（通过 StudentCoach 关系表）
   */
  async findAll(coachId: number, page: number = 1, limit: number = 20, keyword?: string) {
    const skip = (page - 1) * limit;

    // 通过 StudentCoach 查找关联的学员
    const studentCoaches = await this.prisma.studentCoach.findMany({
      where: {
        coachId,
        status: 1,
        deletedAt: null,
      },
      select: { studentId: true },
    });

    const studentIds = studentCoaches.map(sc => sc.studentId);

    if (studentIds.length === 0) {
      return { list: [], total: 0, page, limit };
    }

    const where: any = {
      id: { in: studentIds },
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
            where: { coachId, status: 1, deletedAt: null },
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
        totalSessions: s.coursePackages.reduce((sum, pkg) => sum + pkg.totalSessions, 0),
        usedSessions: s.coursePackages.reduce((sum, pkg) => sum + pkg.usedSessions, 0),
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
   * 获取学员详情（检查教练关系）
   */
  async findOne(id: number, coachId: number) {
    // 先检查该教练是否有关联该学员
    const relation = await this.prisma.studentCoach.findFirst({
      where: { studentId: id, coachId, deletedAt: null },
    });

    if (!relation) {
      throw new NotFoundException('学员不存在或无权限查看');
    }

    const student = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      include: {
        coursePackages: {
          where: { coachId, status: 1, deletedAt: null },
          orderBy: { purchaseDate: 'desc' },
        },
        sessions: {
          where: { coachId },
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
   * 创建学员（同时创建教练-学员关系）
   */
  async create(coachId: number, dto: CreateStudentDto) {
    // 如果有手机号，检查是否已有该学员
    if (dto.phone) {
      const existingStudent = await this.prisma.student.findFirst({
        where: { phone: dto.phone, deletedAt: null },
      });

      if (existingStudent) {
        // 检查是否已有关联
        const existingRelation = await this.prisma.studentCoach.findFirst({
          where: { studentId: existingStudent.id, coachId, deletedAt: null },
        });

        if (existingRelation) {
          // 已有关系，恢复它
          await this.prisma.studentCoach.updateMany({
            where: { studentId: existingStudent.id, coachId },
            data: {
              status: 1,
              deletedAt: null,
            },
          });
        } else {
          // 创建新的教练-学员关系
          await this.prisma.studentCoach.create({
            data: {
              studentId: existingStudent.id,
              coachId,
              startDate: new Date(),
            },
          });
        }

        // 更新教练的活跃学员数
        await this.updateCoachActiveStudents(coachId);

        return this.findOne(existingStudent.id, coachId);
      }
    }

    // 创建新学员
    const inviteCode = this.generateInviteCode();

    const student = await this.prisma.student.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        gender: dto.gender,
        birthday: dto.birthday ? new Date(dto.birthday) : null,
        height: dto.height,
        weight: dto.weight,
        goal: dto.goal,
        note: dto.note,
        avatar: dto.avatar,
        inviteCode,
      },
    });

    // 创建教练-学员关系
    await this.prisma.studentCoach.create({
      data: {
        studentId: student.id,
        coachId,
        startDate: new Date(),
      },
    });

    // 更新教练的活跃学员数
    await this.updateCoachActiveStudents(coachId);

    return this.findOne(student.id, coachId);
  }

  /**
   * 更新学员信息
   */
  async update(id: number, coachId: number, dto: UpdateStudentDto) {
    await this.findOne(id, coachId);

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
   * 删除学员（软删除教练-学员关系，而非删除学员）
   */
  async remove(id: number, coachId: number) {
    await this.findOne(id, coachId);

    await this.prisma.studentCoach.updateMany({
      where: { studentId: id, coachId },
      data: {
        status: 0,
        deletedAt: new Date(),
      },
    });

    // 检查该学员是否还有其他教练关系
    const otherRelations = await this.prisma.studentCoach.count({
      where: { studentId: id, deletedAt: null },
    });

    // 如果没有任何关系了，软删除学员
    if (otherRelations === 0) {
      await this.prisma.student.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    await this.updateCoachActiveStudents(coachId);

    return { success: true };
  }

  /**
   * 批量导入学员（支持课时包）
   */
  async batchImport(coachId: number, students: CreateStudentDto[]) {
    const results = { 
      created: 0, 
      linked: 0, 
      skipped: 0, 
      packagesCreated: 0,
      errors: [] 
    };

    for (const dto of students) {
      try {
        let studentId: number;

        // 如果手机号匹配已有学员
        if (dto.phone) {
          const existing = await this.prisma.student.findFirst({
            where: { phone: dto.phone, deletedAt: null },
          });

          if (existing) {
            const existingRelation = await this.prisma.studentCoach.findFirst({
              where: { studentId: existing.id, coachId, deletedAt: null },
            });

            if (existingRelation) {
              studentId = existing.id;
              results.skipped++;
            } else {
              await this.prisma.studentCoach.create({
                data: {
                  studentId: existing.id,
                  coachId,
                  startDate: new Date(),
                },
              });
              studentId = existing.id;
              results.linked++;
            }
          } else {
            // 创建新学员
            const inviteCode = this.generateInviteCode();
            const student = await this.prisma.student.create({
              data: {
                name: dto.name,
                phone: dto.phone,
                gender: dto.gender,
                birthday: dto.birthday ? new Date(dto.birthday) : null,
                height: dto.height,
                weight: dto.weight,
                goal: dto.goal,
                note: dto.note,
                avatar: dto.avatar,
                inviteCode,
              },
            });

            await this.prisma.studentCoach.create({
              data: {
                studentId: student.id,
                coachId,
                startDate: new Date(),
              },
            });
            studentId = student.id;
            results.created++;
          }
        } else {
          // 无手机号，直接创建新学员 + 关系
          const inviteCode = this.generateInviteCode();
          const student = await this.prisma.student.create({
            data: {
              name: dto.name,
              phone: dto.phone,
              gender: dto.gender,
              birthday: dto.birthday ? new Date(dto.birthday) : null,
              height: dto.height,
              weight: dto.weight,
              goal: dto.goal,
              note: dto.note,
              avatar: dto.avatar,
              inviteCode,
            },
          });

          await this.prisma.studentCoach.create({
            data: {
              studentId: student.id,
              coachId,
              startDate: new Date(),
            },
          });
          studentId = student.id;
          results.created++;
        }

        // 如果有时钟包信息，创建课时包
        if (dto.courseName && dto.totalSessions && dto.totalSessions > 0) {
          await this.prisma.studentCoursePackage.create({
            data: {
              studentId,
              coachId,
              courseName: dto.courseName,
              totalSessions: dto.totalSessions,
              remainingSessions: dto.totalSessions,
              usedSessions: 0,
              price: dto.price ? Math.round(dto.price * 100) : 0,
              purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : new Date(),
              expireDate: dto.expireDate ? new Date(dto.expireDate) : null,
              note: dto.note,
              status: 1,
            },
          });
          results.packagesCreated++;
        }
      } catch (e) {
        results.errors.push(`学员 ${dto.name}: ${e.message}`);
      }
    }

    await this.updateCoachActiveStudents(coachId);

    return results;
  }

  /**
   * 生成邀请码（供学员微信关联使用）
   */
  async generateStudentInviteCode(studentId: number, coachId: number) {
    await this.findOne(studentId, coachId);

    const inviteCode = this.generateInviteCode();
    await this.prisma.student.update({
      where: { id: studentId },
      data: { inviteCode },
    });

    return { inviteCode };
  }

  /**
   * 学员通过邀请码关联微信
   */
  async linkStudentToWechat(inviteCode: string, wechatOpenId: string, wechatUnionId?: string, phone?: string) {
    const student = await this.prisma.student.findUnique({
      where: { inviteCode },
    });

    if (!student) {
      throw new NotFoundException('邀请码无效');
    }

    // 检查是否已关联
    const existing = await this.prisma.studentWechat.findUnique({
      where: { wechatOpenId },
      include: { student: true },
    });

    if (existing) {
      // 同一个关联
      if (existing.studentId === student.id) {
        return {
          message: '已关联',
          student,
          isNew: false,
        };
      }

      // 同一个微信关联其他学员
      await this.prisma.studentWechat.create({
        data: {
          studentId: student.id,
          wechatOpenId,
          wechatUnionId,
          phone: phone || student.phone,
        },
      });

      return {
        message: '已关联新学员',
        student,
        isNew: true,
      };
    }

    // 首次关联
    await this.prisma.studentWechat.create({
      data: {
        studentId: student.id,
        wechatOpenId,
        wechatUnionId,
        phone: phone || student.phone,
      },
    });

    return {
      message: '关联成功',
      student,
      isNew: true,
    };
  }

  /**
   * 通过 OpenID 获取学员关联的所有教练关系
   */
  async getStudentCoachesByOpenId(wechatOpenId: string) {
    const wechats = await this.prisma.studentWechat.findMany({
      where: { wechatOpenId },
      include: {
        student: {
          include: {
            coursePackages: {
              include: { coach: true },
            },
          },
        },
      },
    });

    const relations = [];
    for (const w of wechats) {
      const coachRelations = await this.prisma.studentCoach.findMany({
        where: { studentId: w.studentId, deletedAt: null },
        include: {
          coach: {
            include: {
              user: true,
            },
          },
        },
      });

      relations.push({
        student: w.student,
        coaches: coachRelations,
      });
    }

    return relations;
  }

  /**
   * 更新教练的活跃学员数
   */
  private async updateCoachActiveStudents(coachId: number) {
    const count = await this.prisma.studentCoach.count({
      where: {
        coachId,
        status: 1,
        deletedAt: null,
      },
    });

    await this.prisma.coach.update({
      where: { id: coachId },
      data: { activeStudents: count },
    });
  }
}
