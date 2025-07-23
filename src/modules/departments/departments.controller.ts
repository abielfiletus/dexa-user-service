import { Controller, Post, Body, Get } from '@nestjs/common';
import { HR } from '../../shared/constant/role.constant';
import { Role } from '../../shared/decorators/role-access.decorator';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Role(HR)
  @Post()
  create(@Body() payload: CreateDepartmentDto) {
    return this.departmentsService.create(payload);
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }
}
