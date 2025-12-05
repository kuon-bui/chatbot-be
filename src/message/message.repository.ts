import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Message, MessageDocument } from "@schemas/message.schema";
import { Model, Types } from "mongoose";
import { SaveMessageDto } from "./dto/save-message.dto";


@Injectable()
export class MessageRepository {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) { }

  async create(channelId: Types.ObjectId, senderId: Types.ObjectId, messageData: SaveMessageDto): Promise<MessageDocument> {
    const newMessage = new this.messageModel({
      channel: channelId,
      sender: senderId,
      content: messageData.content,
    });
    return newMessage.save();
  }

  async saveMany(channelId: Types.ObjectId, senderId: Types.ObjectId, messagesData: SaveMessageDto[]): Promise<MessageDocument[]> {
    const newMessages = messagesData.map(messageData => ({
      channel: channelId,
      sender: senderId,
      content: messageData.content,
    }));
    return this.messageModel.insertMany(newMessages);
  }

  async findByChannelId(channelId: Types.ObjectId): Promise<MessageDocument[]> {
    return this.messageModel.find({
      channel: channelId,
    }).populate('sender').populate('channel').exec();
  }

};
