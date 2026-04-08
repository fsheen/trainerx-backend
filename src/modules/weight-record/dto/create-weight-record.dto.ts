import { IsNumber, IsOptional, IsString, Min, Max, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWeightRecordDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  studentId: number;

  @IsNumber()
  @Min(0)
  @Max(500)
  @Type(() => Number)
  weight: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  bodyFat?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  @Type(() => Number)
  muscleMass?: number;

  @IsDateString()
  recordDate: string;

  @IsOptional()
  @IsString()
  note?: string;
}
