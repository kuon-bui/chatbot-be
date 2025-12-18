import { Module } from '@nestjs/common';
import { BotUserService } from './bot-user.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  providers: [BotUserService],
  exports: [BotUserService],
})
export class BotUserModule { }
