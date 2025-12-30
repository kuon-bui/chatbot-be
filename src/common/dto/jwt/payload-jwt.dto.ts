import { Role } from "@enums";

export class UserClaimsDto {
  jti: string;
  isRefresh: boolean;
  sub: string;
  name?: string;
  roles?: Role[];
}
