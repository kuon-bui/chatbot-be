import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy } from "passport-local";
import { PassportStrategy } from '@nestjs/passport';
import { User } from "@schemas";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<User | null> {
    const res = await this.authService.login({ username, password });
    if (!res) {
      throw new UnauthorizedException();
    }

    return res;
  }
}
