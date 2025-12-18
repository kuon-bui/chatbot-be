import { UserClaimsDto } from "@dto";
import { PassportStrategyTypeEnum } from "@enums";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  PassportStrategyTypeEnum.JWT
) {
  constructor(
    private readonly configService: ConfigService
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,

    });
  }

  async validate(payload: UserClaimsDto) {
    console.log('jwt test');
    return { userId: payload.sub, name: payload.name, jti: payload.jti };
  }
}
