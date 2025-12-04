import { Injectable } from '@nestjs/common';
import { User } from 'src/schemas/user.schema';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneByEmail(email);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, await bcrypt.genSalt());
    // Implementation for creating a user
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return plainToInstance(User, user.toObject());
  }
}
