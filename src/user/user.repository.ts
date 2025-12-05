import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "src/schemas/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(id: Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findOneByIdWithTokens(id: Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(id).populate('tokens').exec();
  }

  async create(user: CreateUserDto): Promise<UserDocument> {
    const newUser = new this.userModel(user);
    return newUser.save();
  }
}
