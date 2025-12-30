import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Channel, ChannelDocument } from "@schemas";
import { Model, Types } from "mongoose";
import { BaseRepository } from './base.repository';

@Injectable()
export class ChannelRepository extends BaseRepository<ChannelDocument> {
  constructor(
    @InjectModel(Channel.name) model: Model<ChannelDocument>,
  ) {
    super(model);
  }

  async create(channelData: Partial<Channel>): Promise<ChannelDocument> {
    return super.create(channelData) as Promise<ChannelDocument>;
  }

  async findById(id: Types.ObjectId): Promise<ChannelDocument | null> {
    return super.findById(id);
  }

  async findByUserId(userId: Types.ObjectId): Promise<ChannelDocument | null> {
    return this.model.findOne({ userId }).exec();
  }

  async updateName(id: Types.ObjectId, newName: string): Promise<ChannelDocument | null> {
    return this.model.findByIdAndUpdate(
      id,
      { name: newName },
      { new: true }
    ).exec();
  }
}
