import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { SaveMessageDto } from '@dto';
import { BaseRepository } from './base.repository';
import { Message, MessageDocument } from "@schemas";


@Injectable()
export class MessageRepository extends BaseRepository<MessageDocument> {
  constructor(
    @InjectModel(Message.name) model: Model<MessageDocument>,
  ) {
    super(model);
  }

  async createMessage(channelId: Types.ObjectId, senderId: Types.ObjectId, messageData: SaveMessageDto): Promise<MessageDocument> {

    return this.create({
      channel: channelId,
      sender: senderId,
      content: messageData.content,
    } as Partial<Message>);
  }

  async saveMany(channelId: Types.ObjectId, senderId: Types.ObjectId, messagesData: SaveMessageDto[]): Promise<MessageDocument[]> {
    const newMessages = messagesData.map(messageData => ({
      channel: channelId,
      sender: senderId,
      content: messageData.content,
    }));
    return this.model.insertMany(newMessages);
  }

  async findByChannelId(channelId: Types.ObjectId): Promise<MessageDocument[]> {
    return this.model.find({
      channel: channelId,
    })
      .populate('sender')
      .populate('channel')
      .sort({ createdAt: -1 })
      .exec();
  }
};
