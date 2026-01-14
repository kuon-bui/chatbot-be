import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { AuthProvider } from "@enums";
import { Exclude, Transform } from "class-transformer";
import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.schema";

@Schema()
export class Account extends BaseSchema {
  @Prop({
    type: String,
    enum: AuthProvider,
    default: AuthProvider.Local
  })
  provider: AuthProvider;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Exclude({
    toPlainOnly: true,
  })
  @Prop()
  password: string;

  @Prop({ unique: true, default: null })
  socialId: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  user: User;
}

export type AccountDocument = HydratedDocument<Account>;

export const AccountSchema = SchemaFactory.createForClass(Account);

// Middleware: Tự động thêm token vào user khi save
AccountSchema.post('save', async function (doc: AccountDocument) {
  if (doc.user._id) {
    const UserModel = this.model('User');
    await UserModel.findByIdAndUpdate(
      doc.user._id,
      { $addToSet: { accounts: doc._id } } // $addToSet tránh duplicate
    );
  }
});

// Middleware: Tự động xóa token khỏi user khi delete
AccountSchema.post('findOneAndDelete', async function (doc: AccountDocument) {
  if (doc && doc.user._id) {
    const UserModel = new this.model('User');
    await UserModel.findByIdAndUpdate(
      doc.user._id,
      { $pull: { accounts: doc._id } }
    );
  }
});
