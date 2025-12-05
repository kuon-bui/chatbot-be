import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PayloadJwtDto } from 'src/auth/dto/payload-jwt.dto';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) { }

  @Get('translate')
  async translateText(@CurrentUser() user: PayloadJwtDto, @Query('text') text: string) {
    return this.aiService.translateText(user.sub, text);
  }
}
