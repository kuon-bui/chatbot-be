import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Types } from 'mongoose';
import { SaveMessageDto } from '@dto';
import { Message } from '@schemas';
import { MessageRepository } from '@repositories';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
  ) { }

  async createMessage(channelId: string, senderId: string, messageData: SaveMessageDto) {
    const message = await this.messageRepository.createMessage(
      new Types.ObjectId(channelId),
      new Types.ObjectId(senderId),
      messageData,
    );

    return plainToInstance(Message, message.toObject());
  }

  async getMessagesByChannelId(channelId: Types.ObjectId | string) {
    try {
      const id = typeof channelId === 'string' ? new Types.ObjectId(channelId) : channelId;
      const messages = await this.messageRepository.findByChannelId(id);
      return plainToInstance(Message, messages.map(message => message.toObject()));
    } catch (error) {
      throw error;
    }
  }
}
