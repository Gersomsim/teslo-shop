
export const FileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const extencion = file.mimetype.split('/')[1];
  const validExtencions = ['jpeg', 'jpg', 'png', 'gif'];
  if (validExtencions.includes(extencion)) {
    callback(null, true);
  }
  callback(null, false);
};
