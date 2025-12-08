import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessageModule } from 'src/message/message.module';
import { AiModule } from 'src/ai/ai.module';
@Module({
  imports: [MessageModule, AiModule],
  controllers: [],
  providers: [ChatGateway, ChatService],
})
export class ChatModule { }
