import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 审核教练申请 DTO
 */
export class ReviewApplicationDto {
  @ApiProperty({ description: '审核结果：1-通过，2-拒绝', enum: [1, 2] })
  @IsInt()
  @Min(1)
  @Max(2)
  status: number;

  @ApiPropertyOptional({ description: '拒绝原因（当 status=2 时必填）' })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * 查询申请列表 DTO
 */
export class ListApplicationsDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: '审核状态筛选：0-待审核，1-通过，2-拒绝' })
  @IsInt()
  @Min(0)
  @Max(2)
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '搜索关键词（姓名/手机号）' })
  @IsString()
  @IsOptional()
  keyword?: string;
}
