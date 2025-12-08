import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessageModule } from 'src/message/message.module';
import { AiModule } from 'src/ai/ai.module';
import { ChannelModule } from 'src/channel/channel.module';
import { BotUserModule } from 'src/bot-user/bot-user.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [MessageModule, AiModule, UserModule, BotUserModule, ChannelModule],
  controllers: [],
  providers: [ChatGateway, ChatService],
})
export class ChatModule { }
