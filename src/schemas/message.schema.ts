import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { HydratedDocument, Types } from "mongoose";
import { Transform, Type } from "class-transformer";
import { User } from "./user.schema";
import { Channel } from "./channel.schema";

@Schema()
export class Message extends BaseSchema {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  @Type(() => User)
  sender: User | Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Channel' })
  @Type(() => Channel)
  channel: Channel | Types.ObjectId;

}

export type MessageDocument = HydratedDocument<Message>;

export const MessageSchema = SchemaFactory.createForClass(Message);
