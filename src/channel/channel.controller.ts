import { Controller, Post } from '@nestjs/common';
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
}
