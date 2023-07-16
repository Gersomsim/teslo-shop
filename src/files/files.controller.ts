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
  BadRequestException
} from "@nestjs/common";
import { FilesService } from './files.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { FileFilter } from "./helpers/fileFilter.helper";
import { diskStorage } from "multer";
import { FileNamer } from "./helpers/fileNamer.helper";

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
    console.log(file);
    return {
      fileName: file.originalname,
    };
    // return this.filesService.create();
  }

}
