import { User } from "src/schemas/user.schema";

export class SignInDto {
  email: string;
  password: string;
}

export class SignInResponseDto extends User {
  accessToken: string;
}
