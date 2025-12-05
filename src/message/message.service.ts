import { Injectable } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { SaveMessageDto } from './dto/save-message.dto';
import { plainToInstance } from 'class-transformer';
import { Types } from 'mongoose';
import { Message } from '@schemas/message.schema';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
  ) { }

  async createMessage(channelId: string, senderId: string, messageData: SaveMessageDto) {
    const message = await this.messageRepository.create(
      new Types.ObjectId(channelId),
      new Types.ObjectId(senderId),
      messageData,
    );

    return plainToInstance(Message, message.toObject());
  }

  async getMessagesByChannelId(channelId: Types.ObjectId | string) {
    const id = typeof channelId === 'string' ? new Types.ObjectId(channelId) : channelId;
    const messages = await this.messageRepository.findByChannelId(id);
    return plainToInstance(Message, messages.map(message => message.toObject()));
  }
}
