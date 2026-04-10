import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  // 生产环境使用公共目录（Nginx 静态文件目录），开发环境使用本地目录
  private readonly uploadDir = process.env.NODE_ENV === 'production'
    ? '/var/www/api.trainerx.fit/uploads'
    : path.join(process.cwd(), 'uploads');

  // 备份目录（后端本地，用于调试）
  private readonly backupDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // 生成唯一文件名
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    // 写入主目录（Nginx 静态文件目录）
    fs.writeFileSync(filepath, file.buffer);

    // 同时备份到后端本地目录（调试用）
    if (process.env.NODE_ENV === 'production' && !fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    if (process.env.NODE_ENV === 'production') {
      const backupPath = path.join(this.backupDir, filename);
      fs.writeFileSync(backupPath, file.buffer);
    }

    // 返回完整的 HTTPS URL（生产环境）
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.trainerx.fit' 
      : 'http://localhost:3000';

    return {
      code: 0,
      message: 'success',
      data: {
        url: `${baseUrl}/uploads/${filename}`,
        filename,
      },
    };
  }
}
