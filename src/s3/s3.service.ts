// src/s3/s3.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  S3ClientConfig,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly beEndpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.getOrThrow<string>('AWS_REGION');
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');
    this.beEndpoint = this.configService.getOrThrow<string>('BE_API');

    const s3Config: S3ClientConfig = {
      region: this.region,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    };

    if (this.configService.get<string>('ENVIRONMENT') === 'develop') {
      s3Config.endpoint = this.configService.getOrThrow<string>('AWS_S3_ENDPOINT');
      s3Config.forcePathStyle = true; // Use path-style URLs (http://minio:9000/bucket/file) instead of virtual-hosted-style

    }
    console.log(s3Config);
    this.s3Client = new S3Client(s3Config);
  }

  // Example method to upload an object
  async uploadFile(fileName: string, fileBuffer: Buffer, mimetype: string) {
    const uploadParams: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimetype,
      // ACL: 'public-read', // Use if your bucket is configured for public access
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      const fileUrl = `${this.beEndpoint}/s3/files/${fileName}`;
      return { message: 'File uploaded successfully', url: fileUrl };
    } catch (err) {
      console.error("Error uploading file:", err);
      throw new Error('Failed to upload file to S3');
    }
  }

  async getFile(fileName: string) {
    const getParams = {
      Bucket: this.bucketName,
      Key: fileName,
    };

    try {
      const command = new GetObjectCommand(getParams);
      const response = await this.s3Client.send(command);
      if (!response.Body) {
        throw new Error('File not found in S3');
      }

      type StreamingBlobPayloadOutputTypes = NodeJS.ReadableStream;
      // Convert stream to buffer
      const stream = response.Body as StreamingBlobPayloadOutputTypes;
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }

      const buffer = Buffer.concat(chunks);

      return {
        buffer,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
      };
    } catch (err) {
      console.error('Error downloading file:', err);
      throw new Error('Failed to download file from S3');
    }
  }
}
