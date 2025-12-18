import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Request } from '@interfaces';
import { Types } from 'mongoose';
import { PassportStrategyTypeEnum } from '@enums';
import { UserRepository } from '@repositories';
import { IS_PUBLIC_KEY, } from '@decorators';
import { UserClaimsDto } from '@dto';
import { JIT_CACHE_KEY } from 'src/auth/auth.service';
import { parseTimeToSeconds } from '@utils';

@Injectable()
export class AuthGuard extends PassportAuthGuard(PassportStrategyTypeEnum.JWT) {
  private readonly USER_CACHE_PREFIX = 'user:';
  private readonly USER_CACHE_TTL = parseTimeToSeconds('1h'); // 1 tiếng

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // get the public metadata
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<UserClaimsDto>(token);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      if (await this.cacheManager.get<boolean>(`${JIT_CACHE_KEY}${payload.jti}`)) {
        throw new UnauthorizedException();
      }

      // Kiểm tra cache user trước
      const userCacheKey = `${this.USER_CACHE_PREFIX}${payload.sub}`;
      let user = await this.cacheManager.get<any>(userCacheKey);

      if (!user) {
        // Nếu không có trong cache, query từ database
        const userDoc = await this.userRepository.findOneById(new Types.ObjectId(payload.sub));
        if (!userDoc) {
          throw new UnauthorizedException();
        }

        user = userDoc.toObject();
        // Cache user data với TTL 1 tiếng
        await this.cacheManager.set(userCacheKey, user, this.USER_CACHE_TTL);
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
