import {
  Controller,
  Get,
  Param,
  Post,
  Response,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExcludeEndpoint,
  ApiExtraModels,
  ApiTags,
} from '@nestjs/swagger';
import { FileLocalService } from './file.service';
import { FileResponseDto } from './dto/file-response.dto';
import { ResponseDto } from '@/common/dto/response.dto';
import { ApiCreatedCustomResponse } from '@/common/dto/api-response.decorator';

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FileLocalController {
  constructor(private readonly filesService: FileLocalService) {}

  @ApiExtraModels(ResponseDto, FileResponseDto)
  @ApiCreatedCustomResponse(FileResponseDto)
  @ApiBearerAuth()
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileResponseDto> {
    return this.filesService.create(file);
  }

  @Get(':path')
  @ApiExcludeEndpoint()
  download(@Param('path') path, @Response() response) {
    return response.sendFile(path, { root: './files' });
  }
}
