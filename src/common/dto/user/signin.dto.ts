import { User } from '@schemas';

export class SignInDto {
  email: string;
  password: string;
}

export class SignInResponseDto extends User {
  token: TokenResponse;
}

export class TokenResponse {
  accessToken: string;
  refreshToken: string;
}
