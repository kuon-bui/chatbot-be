import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel } from '@schemas/channel.schema';
import { AuthenticatedUser } from '@decorators/current-user.decorator';
import { UserClaimsDto } from 'src/auth/dto/payload-jwt.dto';

@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
  ) { }

  @Post()
  async getChannelCurrentUser(@AuthenticatedUser() user: UserClaimsDto): Promise<Channel> {
    return this.channelService.getChannelCurrentUser(user.sub);
  }

  @Patch(':id')
  async changeChannelName(
    @AuthenticatedUser() user: UserClaimsDto,
    @Param('id') id: string,
    @Body('name') newName: string
  ): Promise<Channel> {
    // Implementation for changing channel name
    const channel = await this.channelService.getChannelById(id);
    if (channel) {
      return this.channelService.updateChannelName(channel._id, newName);
    }

    throw new Error('Channel not found');
  }
}
