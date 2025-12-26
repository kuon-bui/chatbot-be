import { PassportStrategyTypeEnum } from "@enums";
import { Profile } from "@interfaces";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, PassportStrategyTypeEnum.GOOGLE) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get("GOOGLE_CLIENT_ID", ""),
      clientSecret: configService.get("GOOGLE_CLIENT_SECRET", ""),
      callbackURL: configService.get("GOOGLE_REDIRECT_URI", ""),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    profile.provider = 'google';
    const { name, emails } = profile;

    done(null, profile);
  }
}
