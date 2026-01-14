import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import {
  SignInDto,
  SignInResponseDto,
  TokenResponse,
  UserClaimsDto,
} from '@dto';
import { Account, User } from '@schemas';
import { Profile } from '@interfaces';
import { AuthProvider, Role } from '@enums';
import { AccountRepository, UserRepository } from '@repositories';
import { parseTimeToSeconds } from '@utils';
export const JIT_CACHE_KEY = 'jit-revoked';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private accountRepository: AccountRepository,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async login(certificate: SignInDto): Promise<User | null> {
    const account = await this.accountRepository.findOneByUsernameAndProvider(AuthProvider.Local, certificate.username);

    if (account && await bcrypt.compare(certificate.password, account.password)) {
      return account.user;
    }

    return null;
  }

  generateToken(user: User): TokenResponse {
    const jit = uuidv4();
    const payloadToken: UserClaimsDto = {
      sub: user._id.toString(),
      isRefresh: false,
      name: user.name,
      roles: user.roles,
      jti: jit,
    };
    const payloadRefreshToken: UserClaimsDto = {
      sub: user._id.toString(),
      isRefresh: true,
      jti: jit,
    };

    const tokenTtlSeconds = this.configService.get<string>('JWT_EXPIRATION_TIME', "1h");
    const tokenTtlRefreshSeconds = this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME', "1d");

    return {
      accessToken: this.jwtService.sign(payloadToken, {
        expiresIn: parseTimeToSeconds(tokenTtlSeconds),
      }),
      refreshToken: this.jwtService.sign(payloadRefreshToken, {
        expiresIn: parseTimeToSeconds(tokenTtlRefreshSeconds)
      })
    } as TokenResponse;
  }

  async signToken(user: User): Promise<SignInResponseDto> {
    return plainToInstance(SignInResponseDto, {
      _id: user._id,
      name: user.name,
      roles: user.roles,
      token: this.generateToken(user)
    });
  }

  async renewToken(jti: string, user: User): Promise<SignInResponseDto> {
    const tokenTtlSeconds = this.configService.get<string>('JWT_EXPIRATION_TIME', "1h"); // Example: 1 hour, adjust as needed
    await this.cacheManager.set(`${JIT_CACHE_KEY}:${jti}`, true, parseTimeToSeconds(tokenTtlSeconds));

    return this.signToken(user);
  }

  async logout(jti: string) {
    // Store the jti in Redis with an expiration time equal to the token's TTL
    const tokenTtlSeconds = this.configService.get<string>('JWT_EXPIRATION_TIME', "1h"); // Example: 1 hour, adjust as needed
    await this.cacheManager.set(`${JIT_CACHE_KEY}:${jti}`, true, parseTimeToSeconds(tokenTtlSeconds));

    return { message: 'Logout successful' };
  }

  async checkAccountEmail(email: string): Promise<User | null> {
    const account = await this.accountRepository.findOneByEmailAndProvider(AuthProvider.Google, email);
    if (!account) {
      return null;
    }

    return account.user;
  }

  async loginGoogle(profile: Profile): Promise<SignInResponseDto | null> {
    let existedUser = await this.checkAccountEmail(profile.email);

    if (!existedUser) {
      existedUser = await this.createUserGoogleOAuth(profile);
    }

    return plainToInstance(SignInResponseDto, {
      _id: existedUser._id,
      name: existedUser.name,
      roles: existedUser.roles,
      token: this.generateToken(existedUser)
    });
  }

  async createUserGoogleOAuth(profile: Profile): Promise<User> {
    const accountDocument = new Account();
    accountDocument.email = profile.email;
    accountDocument.provider = AuthProvider.Google;
    accountDocument.socialId = profile.id;
    accountDocument.password = ''; // No password for social login

    const userDocument = new User();
    userDocument.name = profile.displayName;
    userDocument.roles = [Role.User];
    const user = await this.userRepository.create(userDocument);
    accountDocument.user = user;
    await this.accountRepository.create(accountDocument);

    return user.toObject();
  }
}
