import { HttpException, HttpStatus } from "@nestjs/common";

export class JwtInvalidException extends HttpException {
  constructor() {
    super("Invalid JWT token", HttpStatus.FORBIDDEN);
  }
}
