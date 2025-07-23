import { applyDecorators, SetMetadata } from '@nestjs/common';

export enum InternalAccessMethod {
  STRICT = 'STRICT',
  NOT_STRICT = 'NOT_STRICT',
}

export const META_INTERNAL_ACCESS = 'META_INTERNAL_ACCESS';

export const InternalAccess = (strict = InternalAccessMethod.NOT_STRICT) =>
  applyDecorators(SetMetadata(META_INTERNAL_ACCESS, strict));
