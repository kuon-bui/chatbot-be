import { Body, Controller, Param, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { UserClaimsDto } from 'src/auth/dto/payload-jwt.dto';
import { Types } from 'mongoose';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) { }

  @Post('translate')
  async translateText(@AuthenticatedUser() user: UserClaimsDto, @Body('text') text: string) {
    return this.aiService.translateText(new Types.ObjectId(user.sub), text);
  }

  @Post('/channels/:channelId/chat')
  async chatWithAi(
    @AuthenticatedUser() user: UserClaimsDto,
    @Body('message') message: string,
    @Param('channelId') channelId: string,
  ) {
    return this.aiService.chatWithAi(new Types.ObjectId(user.sub), new Types.ObjectId(channelId), message);
  }
}
