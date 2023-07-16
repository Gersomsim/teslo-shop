import { join } from 'path';
import { Injectable } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
  create(image: string) {
    const path = join(__dirname, '../../', 'static', 'products', image);
    console.log(  path);
    if (!existsSync(path)) {
      throw new Error('the image is not exists');
    }
    return path;
  }
}
