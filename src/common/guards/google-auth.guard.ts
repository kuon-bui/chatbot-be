
import { PassportStrategyTypeEnum } from '@enums';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard(PassportStrategyTypeEnum.GOOGLE) {

}
