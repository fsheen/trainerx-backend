import { IsInt, IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

/**
 * 创建站内消息 DTO
 */
export class CreateNotificationDto {
  @IsInt()
  userId: number;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  type: string; // system, booking, checkin, certification

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsObject()
  data?: any;
}

/**
 * 查询消息列表 DTO
 */
export class ListNotificationsDto {
  @IsOptional()
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @IsInt()
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
