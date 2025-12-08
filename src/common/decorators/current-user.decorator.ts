import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserClaimsDto } from "src/common/dto/payload-jwt.dto";

export const AuthenticatedUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserClaimsDto;
  }
);
