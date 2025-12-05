import { Module } from '@nestjs/common';
import { BotUserService } from './bot-user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [BotUserService],
  exports: [BotUserService],
})
export class BotUserModule { }
