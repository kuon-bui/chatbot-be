import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Request } from '@interfaces';
import { Types } from 'mongoose';
import { PassportStrategyTypeEnum } from '@enums';
import { UserRepository } from '@repositories';
import { UserClaimsDto } from '@dto';
import { JIT_CACHE_KEY } from 'src/auth/auth.service';
import { JwtInvalidException } from '@exceptions';
import { USER_CACHE_PREFIX, USER_CACHE_TTL } from './auth.guard';

@Injectable()
export class JwtRefreshAuthGuard extends PassportAuthGuard(PassportStrategyTypeEnum.JWT_REFRESH) {

  constructor(
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new JwtInvalidException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<UserClaimsDto>(token);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      if (await this.cacheManager.get<boolean>(`${JIT_CACHE_KEY}:${payload.jti}`)) {
        throw new UnauthorizedException();
      }

      if (!payload.isRefresh) {
        throw new JwtInvalidException();
      }

      // Kiểm tra cache user trước
      const userCacheKey = `${USER_CACHE_PREFIX}${payload.sub}`;
      let user = await this.cacheManager.get<any>(userCacheKey);

      if (!user) {
        // Nếu không có trong cache, query từ database
        const userDoc = await this.userRepository.findOneById(new Types.ObjectId(payload.sub));
        if (!userDoc) {
          throw new UnauthorizedException();
        }

        user = userDoc.toObject();
        // Cache user data với TTL 1 tiếng
        await this.cacheManager.set(userCacheKey, user, USER_CACHE_TTL);
      }

      request.user = user;
      request.userClaims = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
