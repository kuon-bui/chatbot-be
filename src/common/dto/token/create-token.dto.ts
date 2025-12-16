import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ForModelEnum } from "@enums";

export class CreateTokenDto {
  @ApiProperty({
    description: 'API token value',
    example: 'sk-1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Token name/label',
    example: 'My AI Token',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'AI model type',
    enum: ForModelEnum,
    example: ForModelEnum.DEEPSEEK,
  })
  @IsNotEmpty()
  @IsEnum(ForModelEnum)
  forModel: ForModelEnum;
}
