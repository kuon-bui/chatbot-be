import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Channel, ChannelDocument } from "@schemas/channel.schema";
import { Model, Types } from "mongoose";

@Injectable()
export class ChannelRepository {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
  ) { }

  async create(channelData: Partial<Channel>): Promise<ChannelDocument> {
    const newChannel = new this.channelModel(channelData);
    return newChannel.save();
  }

  async findById(id: Types.ObjectId): Promise<ChannelDocument | null> {
    return this.channelModel.findById(id).exec();
  }

  async findByUserId(userId: Types.ObjectId): Promise<ChannelDocument | null> {
    return this.channelModel.findOne({ userId }).exec();
  }

  async updateName(id: Types.ObjectId, newName: string): Promise<ChannelDocument | null> {
    return this.channelModel.findByIdAndUpdate(
      id,
      { name: newName },
      { new: true }
    ).exec();
  }
}
