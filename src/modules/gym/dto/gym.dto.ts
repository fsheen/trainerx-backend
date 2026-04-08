import { IsNumber, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGymDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFavorite?: boolean;
}

export class UpdateGymDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFavorite?: boolean;
}
