import { IsInt, IsString, IsOptional, IsNumber, Min, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  gender?: number;

  @IsOptional()
  @IsString()
  birthday?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  // 课时包信息（批量导入时用）
  @IsOptional()
  @IsString()
  courseName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalSessions?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  expireDate?: string;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  gender?: number;

  @IsOptional()
  @IsString()
  birthday?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  status?: number;
}

export class CreateCoursePackageDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  studentId: number;

  @IsString()
  courseName: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalSessions: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  expireDate?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateCourseSessionDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  studentId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  packageId?: number;

  @IsString()
  startTime: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration: number;

  @IsOptional()
  @IsString()
  courseType?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  gymId?: number;

  @IsOptional()
  @IsString()
  gymName?: string;

  @IsOptional()
  @IsString()
  gymAddress?: string;
}

export class UpdateCourseSessionDto {
  @IsOptional()
  @IsEnum([0, 1, 2, 3])
  @Type(() => Number)
  status?: number;

  @IsOptional()
  @IsString()
  trainContent?: string;

  @IsOptional()
  @IsString()
  studentState?: string;

  @IsOptional()
  @IsString()
  coachNote?: string;

  @IsOptional()
  @IsString()
  images?: string;

  @IsOptional()
  @IsString()
  cancelReason?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDeducted?: boolean;
}

export class CreateWeightRecordDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  studentId: number;

  @IsNumber()
  @Type(() => Number)
  weight: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bodyFat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  muscleMass?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  recordDate?: string;
}

export class CreateCourseTemplateDto {
  @IsString()
  name: string;

  @IsString()
  courseType: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration: number;

  @IsString()
  exercises: string; // JSON string

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublic?: boolean;
}
