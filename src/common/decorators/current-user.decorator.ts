import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { PayloadJwtDto } from "src/auth/dto/payload-jwt.dto";

export const CurrentUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as PayloadJwtDto;
  }
);
