import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Token, TokenDocument } from "@schemas/token.schema";

@Injectable()
export class TokenRepository {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) { }

  async create(tokenData: Partial<Token>): Promise<TokenDocument> {
    const newToken = new this.tokenModel(tokenData);
    return newToken.save(); // Middleware sẽ tự động update user
  }

  async findByUserId(userId: string): Promise<TokenDocument[]> {
    return this.tokenModel.find({ userId }).exec();
  }

  async delete(id: string): Promise<TokenDocument | null> {
    return this.tokenModel.findByIdAndDelete(id).exec(); // Middleware sẽ tự động xóa khỏi user
  }
}
