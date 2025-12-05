import { IsNotEmpty, IsString } from "class-validator";

export class SaveMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
