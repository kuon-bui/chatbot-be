import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInDto, SignInResponseDto } from 'src/user/dto/signin.dto';
import { UserRepository } from 'src/user/user.repository';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { UserClaimsDto } from './dto/payload-jwt.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UserRepository,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async login(certificate: SignInDto): Promise<SignInResponseDto | null> {
    const user = await this.usersService.findOneByEmail(certificate.email);

    if (user && await bcrypt.compare(certificate.password, user.password)) {
      const payload: UserClaimsDto = {
        sub: user._id.toString(),
        name: user.name,
        email: user.email,
        jti: uuidv4(),
      };

      return plainToInstance(SignInResponseDto, {
        ...user.toObject(),
        accessToken: this.jwtService.sign(payload)
      });
    }

    throw new UnauthorizedException();
  }

  async logout(jti: string) {
    // Store the jti in Redis with an expiration time equal to the token's TTL
    const tokenTtlSeconds = this.configService.get<number>('JWT_EXPIRATION_TIME'); // Example: 1 hour, adjust as needed
    await this.cacheManager.set(jti, true, tokenTtlSeconds);
  }
}
