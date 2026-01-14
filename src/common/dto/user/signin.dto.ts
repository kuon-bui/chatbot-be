import { User } from '@schemas';

export class SignInDto {
  username: string;
  password: string;
}

export class SignInResponseDto extends User {
  token: TokenResponse;
}

export class TokenResponse {
  accessToken: string;
  refreshToken: string;
}
