import { IsString, IsInt, IsOptional, IsArray, Min, Max, Length } from 'class-validator';

export class ApplyCoachDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsInt()
  @Min(0)
  @Max(1)
  gender: number;

  @IsOptional()
  @IsString()
  birthday?: string;

  @IsArray()
  @IsOptional()
  specialty?: string[];

  @IsInt()
  @Min(0)
  @Max(50)
  experience: number;

  @IsString()
  @Length(10, 1000)
  description: string;

  @IsInt()
  @Min(50)
  @Max(2000)
  price: number;

  @IsOptional()
  @IsArray()
  certificates?: any[];

  @IsOptional()
  @IsArray()
  workExperience?: any[];

  @IsOptional()
  @IsArray()
  achievements?: any[];
}
