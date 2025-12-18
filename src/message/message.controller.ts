import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { AuthenticatedUser } from '@decorators';
import { SaveMessageDto, UserClaimsDto } from '@dto';
import { Message } from '@schemas';

@ApiTags('Messages')
@ApiBearerAuth('JWT-auth')
@Controller('channels/:channelId/messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get all messages in a channel' })
  @ApiParam({ name: 'channelId', description: 'Channel ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [Message],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMessages(
    @Param('channelId') channelId: string,
  ) {
    try {
      return this.messageService.getMessagesByChannelId(channelId);
    } catch (error) {
      throw new HttpException('Failed to retrieve messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new message in a channel' })
  @ApiParam({ name: 'channelId', description: 'Channel ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: SaveMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    type: Message,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Channel not found',
  })
  async createMessage(
    @AuthenticatedUser() user: UserClaimsDto,
    @Param('channelId') channelId: string,
    @Body() messageData: SaveMessageDto,
  ) {
    return this.messageService.createMessage(channelId, user.sub, messageData);
  }
}
