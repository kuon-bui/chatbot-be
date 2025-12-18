import { Role } from "@enums";

export class UserClaimsDto {
  sub: string;
  name: string;
  jti: string;
  roles: Role[];
}
