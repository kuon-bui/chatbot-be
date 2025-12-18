import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "@interfaces";
import { UserClaimsDto } from "@dto";
import { User } from "@schemas";

export const CurrentUserClaims = createParamDecorator(
  (data: any, ctx: ExecutionContext): UserClaimsDto => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.userClaims;
  }
);

export const CurrentUser = createParamDecorator(
  (data: any, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  }
);
