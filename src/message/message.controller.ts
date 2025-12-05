import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { SaveMessageDto } from './dto/save-message.dto';
import { AuthenticatedUser } from '@decorators/current-user.decorator';
import { UserClaimsDto } from 'src/auth/dto/payload-jwt.dto';

@Controller('channels/:channelId/messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
  ) { }

  @Get()
  async getMessages(
    @Param('channelId') channelId: string,
  ) {
    return this.messageService.getMessagesByChannelId(channelId);
  }

  @Post()
  async createMessage(
    @AuthenticatedUser() user: UserClaimsDto,
    @Param('channelId') channelId: string,
    @Body() messageData: SaveMessageDto,
  ) {
    return this.messageService.createMessage(channelId, user.sub, messageData);
  }
}
