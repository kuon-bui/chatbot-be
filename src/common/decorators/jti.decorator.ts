import { SetMetadata } from '@nestjs/common';
import { getMetadata } from 'reflect-metadata/no-conflict';

export const JTI_KEY = 'jti';

export const SetJti = (jti: boolean) => SetMetadata(JTI_KEY, jti);
export const GetJti = (target: object, key?: string | symbol) => {
  return getMetadata(JTI_KEY, target);
};
