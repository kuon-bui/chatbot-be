import { Prop } from "@nestjs/mongoose";
import { Transform } from "class-transformer";
import { Types } from "mongoose";

export class BaseSchema {
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: Types.ObjectId;
  @Prop({ default: Date.now })
  createdAt: Date;
  @Prop({
    default: Date.now,
    on: {
      update: Date.now
    }
  })
  updatedAt: Date;
}
