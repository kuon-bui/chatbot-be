import { AuthProvider } from "@enums";
import { InjectModel } from "@nestjs/mongoose";
import { Account, AccountDocument } from "@schemas";
import { Model } from "mongoose";
import { BaseRepository } from './base.repository';

export class AccountRepository extends BaseRepository<AccountDocument> {
  constructor(
    @InjectModel(Account.name) model: Model<AccountDocument>,
  ) {
    super(model);
  }

  async findOneByEmailAndProvider(provider: AuthProvider, email: string): Promise<Account | null> {
    return this.model.findOne({
      provider,
      email
    }).populate("user").exec();
  }

  async findOneByUsernameAndProvider(provider: AuthProvider, username: string, populates: string[] = ["user"]): Promise<Account | null> {
    const q = this.model.findOne({
      provider,
      username
    });

    populates.forEach(field => {
      q.populate(field);
    });

    return q.exec();
  }

  async create(account: Account): Promise<AccountDocument> {
    return super.create(account) as Promise<AccountDocument>;
  }
}
