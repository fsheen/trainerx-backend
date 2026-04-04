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
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

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

    // 写入文件
    fs.writeFileSync(filepath, file.buffer);

    return {
      code: 0,
      message: 'success',
      data: {
        url: `/uploads/${filename}`,
        filename,
      },
    };
  }
}
