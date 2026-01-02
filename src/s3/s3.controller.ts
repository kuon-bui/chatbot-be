// src/s3/s3.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Param, Get, Res, StreamableFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { type Express } from 'express';
import { type Response } from 'express';
import { Public } from '@decorators';
async function createSHA256ShortHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fullHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return fullHash;
}

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Add validators as needed
          new MaxFileSizeValidator({ maxSize: 5000000 }), // 5MB limit
          new FileTypeValidator({ fileType: 'image/jpeg|image/png' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body("path") path: string
  ) {
    // Multer stores the file buffer in memory when not specifying disk storage
    const [name, extension] = file.originalname.split('.');
    const hashedValue = await createSHA256ShortHash(name + Date.now().toString());
    var fileName = `${hashedValue}.${extension}`;
    if (path.length > 0) {
      fileName = `${path}/${fileName}`;
    }
    return this.s3Service.uploadFile(fileName, file.buffer, file.mimetype);
  }

  @Public()
  @Get('files/*params')
  async getFile(@Param("params") params: string[], @Res({ passthrough: true }) res: Response) {
    if (params.length === 0) {
      throw new Error('File name is required');
    }

    const fileName = params.join('/');
    const file = await this.s3Service.getFile(fileName);

    // Set headers for file download
    const displayName = params.pop();

    res.set({
      'Content-Type': file.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${displayName}"`,
      'Content-Length': file.contentLength,
    });

    return new StreamableFile(file.buffer);
  }
}
