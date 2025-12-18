import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelController } from './channel.controller';
import { Channel, ChannelSchema } from '@schemas';
import { ChannelRepository } from '@repositories';

@Module({
  imports: [MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }])],
  providers: [ChannelService, ChannelRepository],
  controllers: [ChannelController],
  exports: [ChannelService, ChannelRepository],
})
export class ChannelModule { }
