import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SignInDto, SignInResponseDto } from '@dto';
import { GetJti, Public } from '@decorators';
import { Profile } from '@interfaces';
import { GoogleOauthGuard } from '@guards';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: SignInResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async signIn(@Body() body: SignInDto): Promise<SignInResponseDto | null> {
    const user = await this.authService.login(body);
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.authService.signToken(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        jti: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  logout(@GetJti() jti: string) {
    // return jti;
    return this.authService.logout(jti);
  }

  @Public()
  @Get("login/google")
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Login with Google (redirect to Google consent)' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth consent page' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  loginGoogle() { }

  @Public()
  @Get("google/callback")
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Google OAuth callback - exchange profile for token' })
  @ApiResponse({ status: 200, description: 'Login successful', type: SignInResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  googleCallback(@Req() req: any) {
    console.log("callback");
    console.log(req.user as Profile);
    return this.authService.loginGoogle(req.user as Profile);
  }

}
