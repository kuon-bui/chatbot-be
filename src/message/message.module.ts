import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '@schemas/message.schema';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
  exports: [MessageService, MessageRepository],
})
export class MessageModule { }
