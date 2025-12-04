import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from './base.schema';
import { Exclude } from 'class-transformer';

@Schema()
export class User extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Exclude({
    toPlainOnly: true,
  })
  @Prop()
  password: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
