import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from '@schemas';
import { TokenRepository } from '@repositories';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema }
    ])
  ],
  providers: [TokenService, TokenRepository],
  controllers: [TokenController]
})
export class TokenModule { }
