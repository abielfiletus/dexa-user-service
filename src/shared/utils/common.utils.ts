import { ValidationError } from '@nestjs/common';

export const mapValidationError = (errors: ValidationError[], result: Record<string, any> = {}) => {
  for (const error of errors) {
    if (error.children?.length) {
      result[error.property] = result[error.property] || {};
      mapValidationError(error.children, result[error.property]);
    }

    if (error.constraints) {
      result[error.property] = Object.values(error.constraints)?.[0];
    }
  }

  return result;
};

export const checkEmpty = (value: any) => {
  return ['', null, undefined].includes(value);
};
