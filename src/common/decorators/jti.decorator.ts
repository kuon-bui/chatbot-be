import { Request } from '@interfaces';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetJti = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const userClaims = request.userClaims;
    console.log(userClaims);
    // Extract JTI from JWT payload stored in request.user
    return userClaims.jti;
  },
);
