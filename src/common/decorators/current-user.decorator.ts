import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserClaimsDto } from "@dto";

export const AuthenticatedUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserClaimsDto;
  }
);
