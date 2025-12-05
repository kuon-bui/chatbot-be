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

  async getChannelById(channelId: string): Promise<Channel> {
    const channelObjectId = new Types.ObjectId(channelId);
    const channel = await this.channelRepository.findById(channelObjectId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    return plainToInstance(Channel, channel.toObject());
  }

  async updateChannelName(channelId: Types.ObjectId, newName: string): Promise<Channel> {
    const updatedChannel = await this.channelRepository.updateName(channelId, newName);
    if (!updatedChannel) {
      throw new Error('Failed to update channel name');
    }

    return plainToInstance(Channel, updatedChannel.toObject());
  }
}
