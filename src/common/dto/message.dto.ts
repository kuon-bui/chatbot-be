import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDto {
  @ApiProperty({
    description: 'Channel ID where the message will be sent',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  channelId: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello everyone!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
