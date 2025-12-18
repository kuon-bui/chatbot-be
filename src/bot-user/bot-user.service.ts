import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { Role } from '@enums';
import { User } from '@schemas';
import { AccountRepository, UserRepository } from '@repositories';

@Injectable()
export class BotUserService implements OnModuleInit {
  private readonly logger = new Logger(BotUserService.name);
  private readonly AI_BOT_CACHE_KEY = 'ai-bot-user-id';
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds

  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async onModuleInit() {
    await this.ensureAiBotUserExists();
  }

  private async ensureAiBotUserExists() {
    try {
      const aiBotEmail = this.configService.get<string>('AI_BOT_EMAIL');
      if (!aiBotEmail) {
        return;
      }
      const aiBotPassword = this.configService.get<string>('AI_BOT_SYSTEM_PASSWORD');
      if (!aiBotPassword) {
        return;
      }

      const existingUser = await this.userRepository.findOne({
        roles: [Role.Bot],
        name: this.configService.get<string>('AI_BOT_NAME', 'AI-Bot'),
      });

      if (!existingUser) {
        this.logger.log('AI-Bot user not found. Creating...');
        const aiBotUserDocument = new User();

        aiBotUserDocument.name = 'AI-Bot';
        aiBotUserDocument.roles = [Role.Bot];
        const aiBotUser = await this.userRepository.create(aiBotUserDocument);

        this.logger.log(`AI-Bot user created successfully with ID: ${aiBotUser._id}`);
        await this.cacheManager.set(this.AI_BOT_CACHE_KEY, aiBotUser._id.toString(), this.CACHE_TTL);
      } else {
        this.logger.log('AI-Bot user already exists. Id: ' + existingUser._id);
        await this.cacheManager.set(this.AI_BOT_CACHE_KEY, existingUser._id.toString(), this.CACHE_TTL);
      }

    } catch (error) {
      throw error;
    }
  }

  async getAiBotUserId(): Promise<Types.ObjectId | null> {
    try {
      // Try to get from cache first
      const cachedId = await this.cacheManager.get<string>(this.AI_BOT_CACHE_KEY);
      if (cachedId) {
        return new Types.ObjectId(cachedId);
      }

      // If not in cache, fetch from DB and renew cache
      const aiBotName = this.configService.get<string>('AI_BOT_NAME', 'AI-Bot');

      const user = await this.userRepository.findOne({
        roles: [Role.Bot],
        name: aiBotName,
      });
      if (user) {
        const userId = user._id.toString();
        await this.cacheManager.set(this.AI_BOT_CACHE_KEY, userId, this.CACHE_TTL);
        return user._id;
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}
