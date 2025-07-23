import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { loadEsm } from 'load-esm';
import { Public } from '../../shared/decorators/public-access.decorator';
import { FilesService } from './files.service';
import { Response } from 'express';

@Public()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('uploads/employees/:path')
  async findAll(@Param('path') folder: string, @Res() res: Response) {
    const { fileTypeFromBuffer } = await loadEsm('file-type');

    const path = 'uploads/employees/' + folder;

    const file = await this.filesService.getFile(path);
    const type = await fileTypeFromBuffer(file);

    res
      .status(HttpStatus.OK)
      .header('Cross-Origin-Resource-Policy', 'Cross-Origin-Resource-Policy')
      .type(type?.mime)
      .send(file);
    // return new StreamableFile(file, {
    //   type: type?.fileType?.mime,
    // });
  }
}
