import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Message } from '@schemas/index';
import { Types } from 'mongoose';
import { AiService } from 'src/ai/ai.service';
import { MessageService } from 'src/message/message.service';


@Injectable()
export class ChatService {
  constructor(
    private readonly messageService: MessageService,
    private readonly aiService: AiService,
  ) { }

  async listAllMessagesInChannel(channelId: string) {
    try {
      return this.messageService.getMessagesByChannelId(channelId);
    } catch (error) {
      throw new WsException('Failed to retrieve messages');
    }
  }

  async receiveMessage(channelId: string, userId: string, content: string): Promise<Message[]> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const channelObjectId = new Types.ObjectId(channelId);

      // Process user message and get AI response
      return await this.aiService.chatWithAi(userObjectId, channelObjectId, content);
    } catch (error) {
      throw new WsException(error.message || 'Failed to process message');
    }
  }
}
