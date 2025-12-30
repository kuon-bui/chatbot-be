import { Role } from "@enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // @IsEnum(Role, { each: true })
  // @ApiProperty({ enum: Role, isArray: true })
  // roles: Role[];
}
