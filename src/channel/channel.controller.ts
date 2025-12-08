import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel } from 'src/common/schemas/channel.schema';
import { AuthenticatedUser } from '@decorators/current-user.decorator';
import { UserClaimsDto } from '@dto/index';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Channels')
@ApiBearerAuth('JWT-auth')
@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Get or create channel for current user' })
  @ApiResponse({
    status: 201,
    description: 'Channel retrieved or created successfully',
    type: Channel,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getChannelCurrentUser(@AuthenticatedUser() user: UserClaimsDto): Promise<Channel> {
    return this.channelService.getChannelCurrentUser(user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update channel name' })
  @ApiParam({ name: 'id', description: 'Channel ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'My Updated Channel' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Channel name updated successfully',
    type: Channel,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Channel not found',
  })
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
