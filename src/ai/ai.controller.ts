import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { CurrentUserClaims } from '@decorators';
import { Types } from 'mongoose';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UserClaimsDto } from '@dto';


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
        text: { type: 'string', example: 'Hello, how are you?' },
        lang: { type: 'string', example: 'Vietnamese' }
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
  async translateText(@CurrentUserClaims() user: UserClaimsDto, @Body('lang') lang: string, @Body('text') text: string) {
    return this.aiService.translateText(new Types.ObjectId(user.sub), lang, text);
  }

  @Get("reload-prompt")
  @ApiOperation({ summary: 'Reload prompt ai' })
  @ApiResponse({
    status: 200,
    description: 'Reload prompt successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'reload prompt successful' }
      }
    }
  })
  async reloadPrompt() {
    await this.aiService.reloadPrompt();
    return {
      message: "reload prompt successful"
    };
  }
}
