import { HttpException, HttpStatus, Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { mapValidationError } from './shared/utils/common.utils';

const logger = new Logger('Dexa User Service');

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ methods: '*', origin: '*' });

  app.useGlobalPipes(
    new ValidationPipe({
      always: true,
      stopAtFirstError: true,
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        throw new HttpException(mapValidationError(errors), HttpStatus.UNPROCESSABLE_ENTITY);
      },
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useBodyParser('json', { limit: '15mb' });

  const configSwagger = new DocumentBuilder()
    .setTitle('Dexa User Service')
    .setDescription(
      'This repository contains all of user management, authorization and site configs data',
    )
    .setVersion('0.1')
    .addBearerAuth(
      {
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(process.env.PORT).then(async () => {
    logger.log(`Apps Running at http://localhost:${process.env.PORT}`);
  });
})();
