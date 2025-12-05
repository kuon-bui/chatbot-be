import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis, { RedisClientOptions } from '@keyv/redis';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { TokenModule } from './token/token.module';
import { RsaModule } from './rsa/rsa.module';
import { AiModule } from './ai/ai.module';
import { HttpModule } from '@nestjs/axios';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { BotUserModule } from './bot-user/bot-user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') as any,
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        stores: [
          new KeyvRedis({
            url: configService.get<string>('REDIS_URL'),
          } as RedisClientOptions),
        ],
      }),
    }),
    HttpModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_TIMEOUT') || 5000,
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    TokenModule,
    RsaModule,
    AiModule,
    ChannelModule,
    MessageModule,
    BotUserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})

export class AppModule { }
