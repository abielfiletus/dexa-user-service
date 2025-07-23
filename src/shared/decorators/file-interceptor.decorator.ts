import { applyDecorators, BadRequestException, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

export interface IFileInterceptor {
  fieldName: string;
  maxCount?: number;
  limit?: number;
  extension?: {
    ext: string[];
    errorMsg: string;
  };
}

export const CustomFileInterceptor = ({
  extension,
  fieldName,
  maxCount = 1,
  limit,
}: IFileInterceptor) => {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, {
        limits: { fileSize: limit },
        fileFilter: (_, file, callback) => {
          const ext = file.originalname.split('.').pop();
          if (extension && !extension.ext.includes(ext)) {
            return callback(new BadRequestException(extension.errorMsg), false);
          }
          callback(null, true);
        },
      }),
    ),
  );
};
