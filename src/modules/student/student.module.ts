import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { CourseSessionController } from './course-session.controller';
import { CourseSessionService } from './course-session.service';
import { CoursePackageController } from './course-package.controller';
import { CoursePackageService } from './course-package.service';

@Module({
  controllers: [
    StudentController,
    CourseSessionController,
    CoursePackageController,
  ],
  providers: [
    StudentService,
    CourseSessionService,
    CoursePackageService,
  ],
  exports: [
    StudentService,
    CourseSessionService,
    CoursePackageService,
  ],
})
export class StudentModule {}
