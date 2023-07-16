
import { v4 as uuid } from 'uuid'
export const FileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);
  const extension = file.mimetype.split('/')[1];
  const filename = `${uuid()}.${extension}`;

  callback(null, filename);
};
