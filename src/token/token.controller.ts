import { Body, Controller, Post } from '@nestjs/common';
import { TokenService } from './token.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/schemas/user.schema';
import { CreateTokenDto } from './dto/create-token.dto';
import { PayloadJwtDto } from 'src/auth/dto/payload-jwt.dto';

@Controller('tokens')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
  ) { }

  @Post()
  async createToken(
    @CurrentUser() user: PayloadJwtDto,
    @Body() createTokenDto: CreateTokenDto,
  ) {
    return this.tokenService.createToken(user, createTokenDto);
  }
}
