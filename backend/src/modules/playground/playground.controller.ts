import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { PlaygroundService } from './playground.service';
import { ApiOperation } from '@nestjs/swagger';
import { GetDto } from './dto/get.dto';
import { ApiOkCustomResponse } from '@/common/dto/api-response.decorator';
import { PostDto } from './dto/post.dto';
import { MailerService } from '../mailer/mailer.service';

@Controller('playground')
export class PlaygroundController {
  constructor(
    private readonly playgroundService: PlaygroundService,
    private readonly mailerService: MailerService,
  ) {}

  @Get('success-object')
  @ApiOperation({ summary: 'Test format response Object' })
  @ApiOkCustomResponse(GetDto, false)
  testObject() {
    return this.playgroundService.getTestObject();
  }

  @Get('success-array')
  @ApiOperation({ summary: 'Test format response Array' })
  @ApiOkCustomResponse(GetDto, true)
  testArray() {
    return this.playgroundService.getTestArray();
  }

  @Get('error-400')
  @ApiOperation({ summary: 'Test error 400 Bad Request' })
  @HttpCode(HttpStatus.BAD_REQUEST)
  testBadRequest() {
    throw new BadRequestException('Data invalid (Test)');
  }

  @Get('error-500')
  @ApiOperation({ summary: 'Test error 500 Server' })
  @HttpCode(HttpStatus.INTERNAL_SERVER_ERROR)
  testServerError() {
    throw new InternalServerErrorException('Server system error (Test)');
  }

  @Post('success')
  @ApiOperation({ summary: 'Test success POST method' })
  @HttpCode(HttpStatus.NO_CONTENT)
  testPost(@Body() body: PostDto) {
    console.log(body);
    return;
  }

  @Post('fail')
  @ApiOperation({ summary: 'Test fail POST method' })
  @HttpCode(HttpStatus.NO_CONTENT)
  testPostFails(@Body() body: PostDto) {
    console.log(body);
    return;
  }

  @Post('test-mailer')
  @ApiOperation({ summary: 'Test mailer service' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async testMailer() {
    return this.mailerService.sendTestEmail();
  }
}
