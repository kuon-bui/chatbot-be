import { Body, Controller, Param, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { UserClaimsDto } from 'src/auth/dto/payload-jwt.dto';
import { Types } from 'mongoose';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('AI')
@ApiBearerAuth('JWT-auth')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) { }

  @Post('translate')
  @ApiOperation({ summary: 'Translate text using AI' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Hello, how are you?' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Text translated successfully',
    schema: {
      type: 'object',
      properties: {
        translatedText: { type: 'string', example: 'Xin chào, bạn khỏe không?' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async translateText(@AuthenticatedUser() user: UserClaimsDto, @Body('text') text: string) {
    return this.aiService.translateText(new Types.ObjectId(user.sub), text);
  }

}
