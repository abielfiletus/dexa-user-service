import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'node:fs';

@Injectable()
export class FilesService {
  async getFile(path: string) {
    if (!fs.existsSync(path)) {
      throw new HttpException('File tidak ditemukan', HttpStatus.BAD_REQUEST);
    }

    return fs.readFileSync(path);
  }
}
