import { Request } from "@interfaces";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const RefreshToken = createParamDecorator(
  (data: any, ctx: ExecutionContext): string | string[] | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.headers.refreshToken;
  }
);
