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
import { Account, User } from '@schemas';
import { AccountRepository } from './auth.repository';
import { Profile } from '@interfaces';
import { AuthProvider, Role } from '@enums';

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
    const account = await this.accountRepository.findOneByEmailAndProvider(AuthProvider.Local, certificate.email);

    if (account && await bcrypt.compare(certificate.password, account.password)) {
      return account.user;
    }

    return null;
  }

  async signToken(user: User): Promise<SignInResponseDto | null> {
    const payload: UserClaimsDto = {
      sub: user._id.toString(),
      name: user.name,
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

    const payload: UserClaimsDto = {
      sub: existedUser._id.toString(),
      name: existedUser.name,
      jti: uuidv4(),
    };

    return plainToInstance(SignInResponseDto, {
      ...existedUser,
      accessToken: this.jwtService.sign(payload)
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
