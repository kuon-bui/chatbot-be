import { Injectable } from '@nestjs/common';
import { TokenRepository } from './token.repository';
import { Token } from '@schemas/token.schema';
import { plainToInstance } from 'class-transformer';
import { CreateTokenDto } from './dto/create-token.dto';
import { RsaService } from 'src/rsa/rsa.service';
import { UserClaimsDto } from 'src/auth/dto/payload-jwt.dto';
import { Types } from 'mongoose';

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
