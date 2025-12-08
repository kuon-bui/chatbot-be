import { User } from '@schemas/index';

export class SignInDto {
  email: string;
  password: string;
}

export class SignInResponseDto extends User {
  accessToken: string;
}
