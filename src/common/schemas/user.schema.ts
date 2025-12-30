import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from './base.schema';
import { Token } from './token.schema';
import { Role } from '@enums';
import { Account } from './account.schema';

@Schema()
export class User extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], enum: Role, default: [Role.User] })
  roles: Role[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Token' }] })
  tokens: Token[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Account' }] })
  accounts: Account[];
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
