import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { TokenRepository } from './token.repository';
import { Token, TokenSchema } from '@schemas/token.schema';
import { MongooseModule } from '@nestjs/mongoose';

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
