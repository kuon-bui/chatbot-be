import { IsEmail, IsNotEmpty, IsString, IsOptional, IsArray, IsEnum } from "class-validator";
import { Role } from "@enums/role.enum";

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

  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  roles?: Role[];
}
