import { applyDecorators, SetMetadata } from '@nestjs/common';

export const META_SKIP_AUTH = 'META_SKIP_AUTH';

export const Public = () => applyDecorators(SetMetadata(META_SKIP_AUTH, true));
