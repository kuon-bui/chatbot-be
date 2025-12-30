import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '@dto';
import { AuthProvider, Role } from '@enums';
import { Account, User } from '@schemas';
import { AccountRepository, UserRepository } from '@repositories';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneByEmail(email);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, await bcrypt.genSalt());
    // Implementation for creating a user

    const userDocument = new User();
    userDocument.name = createUserDto.name;
    const account = new Account();
    account.email = createUserDto.email;
    account.password = hashedPassword;
    account.provider = AuthProvider.Local;
    userDocument.roles = [Role.User];

    const user = await this.userRepository.create(userDocument);
    account.user = user;
    await this.accountRepository.create(account);

    return plainToInstance(User, user.toObject());
  }
}
