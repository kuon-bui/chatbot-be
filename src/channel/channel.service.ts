import { Injectable } from '@nestjs/common';
import { ChannelRepository } from './channel.repository';
import { Channel, ChannelDocument } from '@schemas/channel.schema';
import { Types } from 'mongoose';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ChannelService {
  constructor(
    private readonly channelRepository: ChannelRepository,
  ) { }

  async getChannelCurrentUser(userId: string): Promise<Channel> {
    const userObjectId = new Types.ObjectId(userId);
    var channel = await this.channelRepository.findByUserId(userObjectId);
    if (!channel) {
      channel = await this.channelRepository.create({ userId: userObjectId });
      if (!channel) {
        throw new Error('Cannot create channel for user');
      }
    }

    return plainToInstance(Channel, channel.toObject());
  }
}
