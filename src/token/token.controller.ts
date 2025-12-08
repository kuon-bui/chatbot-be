import { Body, Controller, Post } from '@nestjs/common';
import { TokenService } from './token.service';
import { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { CreateTokenDto } from './dto/create-token.dto';
import { UserClaimsDto } from 'src/auth/dto/payload-jwt.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Token } from 'src/schemas/token.schema';

@ApiTags('Tokens')
@ApiBearerAuth('JWT-auth')
@Controller('tokens')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new API token' })
  @ApiBody({ type: CreateTokenDto })
  @ApiResponse({
    status: 201,
    description: 'Token created successfully',
    type: Token,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async createToken(
    @AuthenticatedUser() user: UserClaimsDto,
    @Body() createTokenDto: CreateTokenDto,
  ) {
    return this.tokenService.createToken(user, createTokenDto);
  }
}
