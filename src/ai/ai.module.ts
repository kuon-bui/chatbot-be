import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { UserModule } from 'src/user/user.module';
import { AiController } from './ai.controller';

@Module({
  imports: [UserModule],
  providers: [AiService],
  controllers: [AiController]
})
export class AiModule { }
