import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { BaseRepository } from './base.repository';
import { User, UserDocument } from '@schemas';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) model: Model<UserDocument>,
  ) {
    super(model);
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email }).exec();
  }

  async findOneById(id: Types.ObjectId): Promise<UserDocument | null> {
    return super.findById(id);
  }

  async findOneByIdWithTokens(id: Types.ObjectId): Promise<UserDocument | null> {
    return this.model.findById(id).populate('tokens').exec();
  }

  async create(user: User): Promise<UserDocument> {
    return super.create(user) as Promise<UserDocument>;
  }

  async findOne(filter: Partial<User>): Promise<UserDocument | null> {
    return super.findOne(filter) as Promise<UserDocument | null>;
  }
}
