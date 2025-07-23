import { applyDecorators, SetMetadata } from '@nestjs/common';

export const META_ROLE_ACCESS = 'META_ROLE_ACCESS';

export const Role = (...roles: string[]) =>
  applyDecorators(SetMetadata(META_ROLE_ACCESS, roles));
