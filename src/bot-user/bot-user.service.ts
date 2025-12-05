import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from 'src/user/user.repository';
import * as bcrypt from 'bcrypt';
import { Role } from '@enums/role.enum';
import { Types } from 'mongoose';

@Injectable()
export class BotUserService implements OnModuleInit {
  private readonly logger = new Logger(BotUserService.name);
  private readonly AI_BOT_CACHE_KEY = 'ai-bot-user-id';
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds

  constructor(
    private readonly userService: UserRepository,
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

      const existingUser = await this.userService.findOneByEmail(aiBotEmail);

      if (!existingUser) {
        this.logger.log('AI-Bot user not found. Creating...');

        const aiBotUser = await this.userService.create({
          name: 'AI-Bot',
          email: aiBotEmail,
          password: await bcrypt.hash(aiBotPassword, await bcrypt.genSalt()),
          roles: [Role.Bot],
        });

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
      const aiBotEmail = this.configService.get<string>('AI_BOT_EMAIL');
      if (!aiBotEmail) {
        return null;
      }

      const user = await this.userService.findOneByEmail(aiBotEmail);
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
