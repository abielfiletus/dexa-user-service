import * as fs from 'node:fs';
import * as process from 'node:process';

export interface IUploadFile {
  file: Express.Multer.File;
  folder: string;
  filename: string;
  ext: string;
  allowedExt: string[];
  allowedSize: number;
}

export const UploadFile = async (params: IUploadFile) => {
  const { ext, file, folder, filename, allowedExt, allowedSize } = params;

  if (!allowedExt.includes(ext)) {
    throw new Error(`Only ${allowedExt.join(', ')} can be uploaded`);
  }

  if (file.size / 1024 > allowedSize) {
    throw new Error(`Must lower than ${allowedSize}kb`);
  }

  const path = process.cwd() + folder;
  const filePath = filename + '.' + ext;

  fs.mkdirSync(path, { recursive: true });

  fs.writeFileSync(path + filePath, file.buffer);

  return folder + filePath;
};
