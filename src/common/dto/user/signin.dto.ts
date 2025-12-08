import { User } from "@schemas";

export class SignInDto {
  email: string;
  password: string;
}

export class SignInResponseDto extends User {
  accessToken: string;
}
