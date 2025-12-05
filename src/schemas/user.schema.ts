import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from './base.schema';
import { Exclude, Transform } from 'class-transformer';
import { Token } from './token.schema';
import { Role } from '@enums/role.enum';

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

  @Prop({ type: [String], enum: Role, default: [Role.User] })
  roles: Role[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Token' }] })
  tokens: Token[];
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
