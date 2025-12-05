import { Body, Controller, Post } from '@nestjs/common';
import { TokenService } from './token.service';
import { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { CreateTokenDto } from './dto/create-token.dto';
import { UserClaimsDto } from 'src/auth/dto/payload-jwt.dto';

@Controller('tokens')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
  ) { }

  @Post()
  async createToken(
    @AuthenticatedUser() user: UserClaimsDto,
    @Body() createTokenDto: CreateTokenDto,
  ) {
    return this.tokenService.createToken(user, createTokenDto);
  }
}
