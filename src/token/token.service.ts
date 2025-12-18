import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Types } from 'mongoose';
import { CreateTokenDto, UserClaimsDto } from '@dto';
import { TokenRepository } from '@repositories';
import { RsaService } from '@rsa/rsa.service';
import { Token } from '@schemas';

@Injectable()
export class TokenService {
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly rsaService: RsaService,
  ) { }

  async createToken(user: UserClaimsDto, createTokenDto: CreateTokenDto): Promise<Token> {
    // Implementation for creating a token
    const encryptedToken = this.rsaService.encrypt(createTokenDto.token);
    createTokenDto.token = encryptedToken;
    const tokenDoc = await this.tokenRepository.create({ userId: new Types.ObjectId(user.sub), ...createTokenDto });
    return plainToInstance(Token, tokenDoc.toObject());
  }
}
