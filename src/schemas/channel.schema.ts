import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { HydratedDocument, Types } from "mongoose";
import { Transform } from "class-transformer";

@Schema()
export class Channel extends BaseSchema {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  userId: Types.ObjectId;

}

export type ChannelDocument = HydratedDocument<Channel>;

export const ChannelSchema = SchemaFactory.createForClass(Channel);
