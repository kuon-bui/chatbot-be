import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, OnModuleInit, Type } from '@nestjs/common';
import { ForModelEnum } from '@enums/for-model.enum';
import { RsaService } from 'src/rsa/rsa.service';
import { UserRepository } from 'src/user/user.repository';
import { DeepseekChoice, DeepSeekResponseDto } from './dto/deepseek-response.dto';
import Mustache from 'mustache';
import * as fs from 'fs';
import * as path from 'path';
import { BotUserService } from 'src/bot-user/bot-user.service';
import { Types } from 'mongoose';
import { DeepseekRequestDto, DeepseekRole } from './dto/deepseek-request.dto';
import { ConfigService } from '@nestjs/config';
import { ChannelRepository } from 'src/channel/channel.repository';
import { MessageRepository } from 'src/message/message.repository';
import { SaveMessageDto } from 'src/message/dto/save-message.dto';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly PROMPT_CACHE_PREFIX = 'prompt:';

  constructor(
    private readonly httpService: HttpService,
    private readonly userRepository: UserRepository,
    private readonly rsaService: RsaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly botUserService: BotUserService,
    private readonly configService: ConfigService,
    private readonly messageRepository: MessageRepository,
    private readonly channelRepository: ChannelRepository,
  ) { }

  onModuleInit() {
    this.loadPrompts();
  }

  private async loadPrompts() {
    const promptsDir = path.join(process.cwd(), 'prompts');
    await this.scanDirectory(promptsDir, promptsDir);
  }

  private async scanDirectory(dir: string, baseDir: string) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        await this.scanDirectory(fullPath, baseDir);
      } else if (stat.isFile() && item.endsWith('.txt')) {
        // Generate key: "folder-filename" (without extension)
        const relativePath = path.relative(baseDir, fullPath);
        const key = relativePath
          .replace(/\\/g, '/') // Convert backslashes to forward slashes
          .replace(/\.txt$/, '') // Remove .txt extension
          .replace(/\//g, '-'); // Replace / with -

        // Load file content and save to cache
        const content = fs.readFileSync(fullPath, 'utf-8');
        await this.cacheManager.set(
          `${this.PROMPT_CACHE_PREFIX}${key}`,
          content,
          60 * 60 * 1000 // 1 hour expiration
        );
      }
    }
  }

  private async getPrompt(key: string): Promise<string | null> {
    const prompt = await this.cacheManager.get<string>(`${this.PROMPT_CACHE_PREFIX}${key}`);
    if (!prompt) {
      await this.loadPrompts();
      const reloadedPrompt = await this.cacheManager.get<string>(`${this.PROMPT_CACHE_PREFIX}${key}`);
      if (!reloadedPrompt)
        throw new Error(`Prompt not found for key: ${key}`);
      return reloadedPrompt;
    }

    return prompt;
  }

  async translateText(userId: Types.ObjectId, text: string): Promise<DeepseekChoice[]> {
    const userDoc = await this.userRepository.findOneByIdWithTokens(userId);
    if (!userDoc) {
      throw new Error('User not found');
    }

    const user = userDoc.toObject();
    const deepSeekToken = user.tokens?.find(token => token.forModel === ForModelEnum.DEEPSEEK);
    if (!deepSeekToken) {
      throw new Error('Deepseek token not found for user');
    }

    const forModel = deepSeekToken.forModel.toLowerCase();

    // Get prompt from cache
    const promptKey = `translate-${forModel}`;
    const promptTemplate = await this.getPrompt(promptKey);

    if (!promptTemplate) {
      throw new Error(`Prompt not found for key: ${promptKey}`);
    }

    const prompt = Mustache.render(promptTemplate, { text });

    const token = this.rsaService.decrypt(deepSeekToken.token);
    // Call to external AI translation service
    const apiUrl = this.configService.get<string>('DEEPSEEK_API_URL');
    if (!apiUrl) {
      throw new Error('DEEPSEEK_API_URL is not configured');
    }

    const response = await this.httpService.axiosRef.post<DeepSeekResponseDto>(apiUrl, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt,
        }
      ]
    } as DeepseekRequestDto, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.choices;
  }

  async chatWithAi(userId: Types.ObjectId, channelId: Types.ObjectId, message: string) {
    const userDoc = await this.userRepository.findOneByIdWithTokens(userId);
    if (!userDoc) {
      throw new Error('User not found');
    }

    const user = userDoc.toObject();
    const deepSeekToken = user.tokens?.find(token => token.forModel === ForModelEnum.DEEPSEEK);
    if (!deepSeekToken) {
      throw new Error('Deepseek token not found for user');
    }

    const aiBotUserIdStr = await this.botUserService.getAiBotUserId();
    if (!aiBotUserIdStr) {
      throw new Error('AI-Bot user is not configured properly.');
    }
    const aiBotUserId = new Types.ObjectId(aiBotUserIdStr);


    const channel = await this.channelRepository.findById(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    if (!channel.userId.equals(userId)) {
      throw new Error('Unauthorized access to channel');
    }

    const req: DeepseekRequestDto = {
      model: 'deepseek-chat',
      messages: [],
    };

    const messages = await this.messageRepository.findByChannelId(channelId);
    for (const msg of messages) {

      var role: DeepseekRole = 'assistant';
      if (msg.sender instanceof Types.ObjectId) {
        if (msg.sender.equals(userId)) {
          role = 'user';
        }
      } else if (typeof msg.sender === 'object' && '_id' in msg.sender) {
        if ((msg.sender as any)._id.equals(userId)) {
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
      content: message,
    });

    const apiUrl = this.configService.get<string>('DEEPSEEK_API_URL');
    if (!apiUrl) {
      throw new Error('DEEPSEEK_API_URL is not configured');
    }

    const token = this.rsaService.decrypt(deepSeekToken.token);
    console.log("req:", req);
    const response = await this.httpService.axiosRef.post<DeepSeekResponseDto>(apiUrl, req, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const newMessage = response.data.choices.map((e: DeepseekChoice): SaveMessageDto => {
      return { content: e.message.content };
    });

    // Save messages to database
    await this.messageRepository.create(channel._id, userId, { content: message });
    await this.messageRepository.saveMany(channel._id, aiBotUserId, newMessage);

    return response.data.choices;
  }
}
