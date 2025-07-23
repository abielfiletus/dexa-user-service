import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AuthGuard } from '../shared/guards/auth.guard';
import { Token, TokenSchema } from './auths/schemas/token.schemas';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { AuthModule } from './auths/auth.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.env.NODE_ENV ? process.env.NODE_ENV : ''}.env`,
      validationSchema: Joi.object({
        PORT: Joi.number().required().default(3000),
        MONGO_URL: Joi.string().required(),
        MONGO_DATABASE: Joi.string().required(),
        SALT_ROUND: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        FILE_URL: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const options: MongooseModuleOptions = {
          uri: `mongodb://${process.env.MONGO_URL}`,
          dbName: process.env.MONGO_DATABASE,
          ignoreUndefined: false,
        };
        return options;
      },
    }),
    MongooseModule.forFeature([
      {
        name: Token.name,
        schema: TokenSchema,
      },
    ]),
    AuthModule,
    DepartmentsModule,
    EmployeesModule,
    FilesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
