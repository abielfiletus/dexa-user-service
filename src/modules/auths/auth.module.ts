import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesModule } from '../employees/employees.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Token, TokenSchema } from './schemas/token.schemas';

@Module({
  controllers: [AuthController],
  imports: [
    MongooseModule.forFeature([
      {
        name: Token.name,
        schema: TokenSchema,
      },
    ]),
    EmployeesModule,
  ],
  providers: [AuthService],
})
export class AuthModule {}
