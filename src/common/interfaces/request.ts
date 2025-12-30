import { UserClaimsDto } from "@dto";
import { User } from "@schemas";
import { Request as expressRequest } from "express";

export interface Request extends expressRequest {
  user: User;
  userGoogle: any;
  userFacebook: any;
  userClaims: UserClaimsDto;
}
