import { ForModelEnum } from '@enums/for-model.enum';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Message } from 'src/common/schemas/message.schema';
import { Types } from 'mongoose';
import { AiService } from 'src/ai/ai.service';
import { DeepseekRequestDto, DeepseekRole } from 'src/common/dto/deepseek-request.dto';
import { DeepseekChoice, DeepSeekResponseDto } from 'src/common/dto/deepseek-response.dto';
import { BotUserService } from 'src/bot-user/bot-user.service';
import { ChannelRepository } from 'src/channel/channel.repository';
import { SaveMessageDto } from 'src/common/dto/save-message.dto';
import { MessageRepository } from 'src/message/message.repository';
import { MessageService } from 'src/message/message.service';
import { RsaService } from 'src/rsa/rsa.service';
import { UserRepository } from 'src/user/user.repository';

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
