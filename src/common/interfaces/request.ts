import { UserClaimsDto } from "@dto";
import { User } from "@schemas/user.schema";
import { Request as expressRequest } from "express";

export interface Request extends expressRequest {
  user: User;
  userClaims: UserClaimsDto;
}
