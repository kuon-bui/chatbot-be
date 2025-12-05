import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from 'src/user/dto/signin.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() certificate: SignInDto) {
    return this.authService.login(certificate);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Body('jti') jti: string) {
    return this.authService.logout(jti);
  }
}
