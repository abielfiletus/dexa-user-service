import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { EMPLOYEE, HR } from '../../shared/constant/role.constant';
import { CustomFileInterceptor } from '../../shared/decorators/file-interceptor.decorator';
import {
  InternalAccess,
  InternalAccessMethod,
} from '../../shared/decorators/internal-access.decorator';
import { Role } from '../../shared/decorators/role-access.decorator';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { FindAllEmployeeDto } from './dto/find-all-employee.dto';
import { FindIdsDto } from './dto/find-ids.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@ApiBearerAuth('access-token')
@Role(HR, EMPLOYEE)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Role(HR)
  @ApiConsumes('multipart/form-data')
  @Post()
  @CustomFileInterceptor({
    fieldName: 'photo',
    limit: 1024 * 1024 * 2,
    extension: {
      ext: ['jpg', 'jpeg', 'png'],
      errorMsg: 'Only image file are allowed!',
    },
  })
  create(@Body() payload: CreateEmployeeDto, @UploadedFiles() photo: Express.Multer.File[]) {
    payload.photo = photo?.[0];
    return this.employeesService.create(payload);
  }

  @InternalAccess()
  @Role(HR)
  @Get()
  findAll(@Query() query: FindAllEmployeeDto) {
    return this.employeesService.findAll(query);
  }

  @InternalAccess(InternalAccessMethod.STRICT)
  @Get('ids')
  getIds(@Query() query: FindIdsDto) {
    return this.employeesService.getIds(query);
  }

  @InternalAccess()
  @Get('by-email/:email')
  findByEmail(@Param('email') email: string) {
    return this.employeesService.getByEmail(email);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  @CustomFileInterceptor({
    fieldName: 'photo',
    limit: 1024 * 1024 * 2,
    extension: {
      ext: ['jpg', 'jpeg', 'png'],
      errorMsg: 'Only image file are allowed!',
    },
  })
  update(
    @Param('id') id: string,
    @Body() payload: UpdateEmployeeDto,
    @UploadedFiles() photo: Express.Multer.File[],
    @Req() req: Request,
  ) {
    payload.photo = photo?.[0];
    return this.employeesService.update(req['user']?.email, id, payload);
  }

  @Role(HR)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.delete(id);
  }
}
