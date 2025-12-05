import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelRepository } from './channel.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Channel } from 'diagnostics_channel';
import { ChannelSchema } from '@schemas/channel.schema';
import { ChannelController } from './channel.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }])],
  providers: [ChannelService, ChannelRepository],
  controllers: [ChannelController],
  exports: [ChannelService, ChannelRepository],
})
export class ChannelModule { }
