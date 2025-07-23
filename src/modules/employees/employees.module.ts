import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee, EmployeeSchema } from './schemas/employee.schema';

@Module({
  controllers: [EmployeesController],
  imports: [
    MongooseModule.forFeature([
      {
        name: Employee.name,
        schema: EmployeeSchema,
      },
    ]),
    ClientsModule.register([
      {
        name: 'DEXA_LOGGING_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'dexa-logging',
            brokers: ['localhost:9092'],
          },
          producerOnlyMode: true,
          producer: { allowAutoTopicCreation: true },
        },
      },
    ]),
  ],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
