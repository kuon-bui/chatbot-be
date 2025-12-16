import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { UserClaimsDto } from '../../common/dto/jwt/payload-jwt.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Request } from '@interfaces';
import { UserRepository } from 'src/user/user.repository';
import { Types } from 'mongoose';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("here");
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
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
      if (await this.cacheManager.get<boolean>(payload.jti)) {
        throw new UnauthorizedException();
      }
      const user = await this.userRepository.findOneById(new Types.ObjectId(payload.sub));
      if (!user) {
        throw new UnauthorizedException();
      }

      request.user = user.toObject();
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
