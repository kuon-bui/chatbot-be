import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { Exclude, Transform } from "class-transformer";
import { HydratedDocument, Types } from "mongoose";
import { ForModelEnum } from "src/common/enums/for-model.enum";

@Schema()
export class Token extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Exclude({
    toPlainOnly: true,
  })

  @Prop()
  token: string;

  @Prop({ required: true, enum: ForModelEnum, unique: true })
  forModel: ForModelEnum;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  userId: Types.ObjectId;
}

export type TokenDocument = HydratedDocument<Token>;

export const TokenSchema = SchemaFactory.createForClass(Token);

// Middleware: Tự động thêm token vào user khi save
TokenSchema.post('save', async function (doc: TokenDocument) {
  if (doc.userId) {
    const UserModel = this.model('User');
    await UserModel.findByIdAndUpdate(
      doc.userId,
      { $addToSet: { tokens: doc._id } } // $addToSet tránh duplicate
    );
  }
});

// Middleware: Tự động xóa token khỏi user khi delete
TokenSchema.post('findOneAndDelete', async function (doc: TokenDocument) {
  if (doc && doc.userId) {
    const UserModel = new this.model('User');
    await UserModel.findByIdAndUpdate(
      doc.userId,
      { $pull: { tokens: doc._id } }
    );
  }
});
