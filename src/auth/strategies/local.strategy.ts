import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy } from "passport-local";
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from "../auth.service";
import { User } from "@schemas";

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
    console.log(username, password);
    const res = await this.authService.login({ email: username, password: password });
    if (!res) {
      throw new UnauthorizedException();
    }

    return res;
  }
}
