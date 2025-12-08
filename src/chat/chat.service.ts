import { ForModelEnum } from '@enums/for-model.enum';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Message } from '@schemas/message.schema';
import { Types } from 'mongoose';
import { DeepseekRequestDto, DeepseekRole } from 'src/ai/dto/deepseek-request.dto';
import { DeepseekChoice, DeepSeekResponseDto } from 'src/ai/dto/deepseek-response.dto';
import { BotUserService } from 'src/bot-user/bot-user.service';
import { ChannelRepository } from 'src/channel/channel.repository';
import { SaveMessageDto } from 'src/message/dto/save-message.dto';
import { MessageRepository } from 'src/message/message.repository';
import { MessageService } from 'src/message/message.service';
import { RsaService } from 'src/rsa/rsa.service';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class ChatService {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageRepository: MessageRepository,
    private readonly httpService: HttpService,
    private readonly userRepository: UserRepository,
    private readonly botUserService: BotUserService,
    private readonly channelRepository: ChannelRepository,
    private readonly rsaService: RsaService,
    private readonly configService: ConfigService,
  ) { }

  async listAllMessagesInChannel(channelId: string) {
    return this.messageService.getMessagesByChannelId(channelId);
  }

  async receiveMessage(channelName: string, sender: string, content: string): Promise<Message[]> {
    const channelId = new Types.ObjectId(channelName);
    const senderId = new Types.ObjectId(sender);
    const userDoc = await this.userRepository.findOneByIdWithTokens(senderId);
    if (!userDoc) {
      throw new WsException('User not found');
    }
    const user = userDoc.toObject();
    const deepSeekToken = user.tokens?.find(token => token.forModel === ForModelEnum.DEEPSEEK);
    if (!deepSeekToken) {
      throw new WsException('Deepseek token not found for user');
    }
    const aiBotUserIdStr = await this.botUserService.getAiBotUserId();
    if (!aiBotUserIdStr) {
      throw new WsException('AI-Bot user is not configured properly.');
    }
    const aiBotUserId = new Types.ObjectId(aiBotUserIdStr);
    const channel = await this.channelRepository.findById(channelId);
    if (!channel) {
      throw new WsException('Channel not found');
    }

    if (!channel.userId.equals(user._id)) {
      throw new WsException('Unauthorized access to channel');
    }

    const apiUrl = this.configService.get<string>('DEEPSEEK_API_URL');
    if (!apiUrl) {
      throw new WsException('DEEPSEEK_API_URL is not configured');
    }


    const req: DeepseekRequestDto = {
      model: 'deepseek-chat',
      messages: [],
    };

    const messages = await this.messageRepository.findByChannelId(channelId);
    for (const msg of messages) {

      var role: DeepseekRole = 'assistant';
      if (msg.sender instanceof Types.ObjectId) {
        if (msg.sender.equals(senderId)) {
          role = 'user';
        }
      } else if (typeof msg.sender === 'object' && '_id' in msg.sender) {
        if ((msg.sender as any)._id.equals(senderId)) {
          role = 'user';
        }
      }
      req.messages.push({
        role: role,
        content: msg.content,
      });
    }
    req.messages.push({
      role: 'user',
      content: content,
    });
    const token = this.rsaService.decrypt(deepSeekToken.token);

    const response = await this.httpService.axiosRef.post<DeepSeekResponseDto>(apiUrl, req, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new WsException(`Deepseek API error: ${response.status} ${response.statusText}`);
    }

    const newMessage = response.data.choices.map((e: DeepseekChoice): SaveMessageDto => {
      return { content: e.message.content };
    });

    const userMessage = await this.messageRepository.create(channel._id, senderId, { content });
    const aiBotMessages = await this.messageRepository.saveMany(channel._id, aiBotUserId, newMessage);

    return [userMessage, ...aiBotMessages];
  }
}
