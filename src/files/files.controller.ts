import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException, Res
} from "@nestjs/common";
import { FilesService } from './files.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { FileFilter } from "./helpers/fileFilter.helper";
import { diskStorage } from "multer";
import { FileNamer } from "./helpers/fileNamer.helper";
import { Response } from "express";

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: FileFilter,
      limits: {
        // fileSize: 1000
      },
      storage: diskStorage({
        destination: './static/products',
        filename: FileNamer,
      }),
    }),
  )
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }
    const secureUrl = `${file.filename}`
    return {
      fileName: secureUrl
    };
    // return this.filesService.create();
  }
  @Get('product/:image')
  findImage(
    @Res() res: Response,
    @Param('image') image: string
  ) {
    const path = this.filesService.create(image);
    res.sendFile(path);
  }
}
