import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { UserModule } from 'src/user/user.module';
import { AiController } from './ai.controller';
import { MessageModule } from 'src/message/message.module';
import { BotUserModule } from 'src/bot-user/bot-user.module';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  imports: [UserModule, MessageModule, BotUserModule, ChannelModule],
  providers: [AiService],
  controllers: [AiController]
})
export class AiModule { }
