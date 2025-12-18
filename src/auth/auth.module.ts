import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { Account, AccountSchema } from '@schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountRepository } from '@repositories';
import { GoogleStrategy, JwtStrategy, LocalStrategy } from '@strategies';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy, AccountRepository],
  exports: [AccountRepository],
})
export class AuthModule { }
