import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ForModelEnum } from "src/common/enums/for-model.enum";

export class CreateTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(ForModelEnum)
  forModel: ForModelEnum;
}
