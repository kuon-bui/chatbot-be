import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SaveMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how can I help you?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
