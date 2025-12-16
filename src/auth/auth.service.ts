import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/user/user.repository';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { UserClaimsDto } from '../common/dto/jwt/payload-jwt.dto';
import { ConfigService } from '@nestjs/config';
import { SignInDto, SignInResponseDto } from '@dto';
import { User } from '@schemas/user.schema';
import { Profile } from 'passport';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserRepository,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async login(certificate: SignInDto): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(certificate.email);

    if (user && await bcrypt.compare(certificate.password, user.password)) {
      return user.toObject();
    }

    return null;
  }
  public async authenticateOneTapGoogle(profile: Profile) {
    const { name, emails, photos } = profile;
    // const email = emails?.at(0)?.value;
    console.log("emails", emails);
    console.log("photos", photos);
    console.log("name", name);
  }

  async signToken(user: User): Promise<SignInResponseDto | null> {
    const payload: UserClaimsDto = {
      sub: user._id.toString(),
      name: user.name,
      email: user.email,
      jti: uuidv4(),
    };

    return plainToInstance(SignInResponseDto, {
      ...user,
      accessToken: this.jwtService.sign(payload)
    });
  }

  async logout(jti: string) {
    // Store the jti in Redis with an expiration time equal to the token's TTL
    const tokenTtlSeconds = this.configService.get<number>('JWT_EXPIRATION_TIME'); // Example: 1 hour, adjust as needed
    await this.cacheManager.set(jti, true, tokenTtlSeconds);
  }
}
