import { AuthProvider } from "@enums";
import { InjectModel } from "@nestjs/mongoose";
import { Account, AccountDocument } from "@schemas";
import { Model } from "mongoose";

export class AccountRepository {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) { }

  async findOneByEmailAndProvider(provider: AuthProvider, email: string): Promise<Account | null> {
    return this.accountModel.findOne({
      provider,
      email
    }).populate("user").exec();
  }

  async create(account: Account): Promise<AccountDocument> {
    const newAccount = new this.accountModel({
      ...account
    });
    return newAccount.save();
  }
}
