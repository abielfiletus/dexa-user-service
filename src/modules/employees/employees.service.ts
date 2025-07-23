import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { PaginateModel, PaginateOptions } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { checkEmpty } from '../../shared/utils/common.utils';
import { UploadFile } from '../../shared/utils/uploader.utils';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { FindAllEmployeeDto } from './dto/find-all-employee.dto';
import { FindIdsDto } from './dto/find-ids.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './schemas/employee.schema';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: PaginateModel<Employee>,
    @Inject('DEXA_LOGGING_SERVICE')
    private readonly client: ClientKafkaProxy,
    private readonly configService: ConfigService,
  ) {}

  private readonly saltRounds = this.configService.get<number>('SALT_ROUND');

  async getByEmail(email: string) {
    return await this.employeeModel.findOne({ email }).populate('department').exec();
  }

  async getIds(payload: FindIdsDto) {
    const { keyword } = payload;
    const filterValue = new RegExp(keyword, 'i');

    return await this.employeeModel
      .find({ $or: [{ name: filterValue }, { email: filterValue }] }, '_id')
      .exec();
  }

  async create(payload: CreateEmployeeDto) {
    try {
      if (!payload.photo) {
        throw new HttpException({ photo: 'Photo is required' }, HttpStatus.UNPROCESSABLE_ENTITY);
      }

      const photo = await UploadFile({
        file: payload.photo,
        filename: 'photo-' + Date.now(),
        ext: payload.photo.mimetype.split('/')[1],
        folder: '/uploads/employees/',
        allowedSize: 2 * 1024,
        allowedExt: ['jpg', 'jpeg', 'png'],
      });

      payload.password = bcrypt.hashSync('123456', this.saltRounds);
      payload.role = 'employee';

      return await this.employeeModel.create({ ...payload, photo });
    } catch (err) {
      console.log(err.code);
      if (err.code === 11000) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      throw err;
    }
  }

  async update(userEmail: string, id: string, payload: UpdateEmployeeDto) {
    try {
      if (!userEmail) {
        throw new UnauthorizedException();
      }

      const check = await this.employeeModel.findById(id, '-password -createdAt -updatedAt');
      if (!check) {
        throw new HttpException('Employee not found', HttpStatus.BAD_REQUEST);
      }

      let updated_by: any;
      if (userEmail === check.email) {
        updated_by = check._id;
      } else {
        const user = await this.employeeModel.findOne({ email: userEmail });
        updated_by = user._id;
      }

      const mock: Record<string, any> = {};
      Object.keys(payload).map((key) => {
        if (!checkEmpty(payload[key])) mock[key] = payload[key];
      });

      if (payload.photo) {
        mock.photo = await UploadFile({
          file: payload.photo,
          filename: 'photo-' + Date.now(),
          ext: payload.photo.mimetype.split('/')[1],
          folder: '/uploads/employees/',
          allowedSize: 2 * 1024,
          allowedExt: ['jpg', 'jpeg', 'png'],
        });
      }

      const updated = await this.employeeModel
        .findByIdAndUpdate(id, mock, { new: true, projection: '-password -createdAt -updatedAt' })
        .exec();

      const stringifyOld = JSON.stringify(check.toJSON());
      const stringifyNew = JSON.stringify(updated.toJSON());
      if (stringifyNew !== stringifyOld) {
        await lastValueFrom(
          this.client.emit('employee_update', {
            user: id,
            before: check,
            after: updated,
            updated_by,
          }),
        );
      }

      return updated;
    } catch (err) {
      throw err;
    }
  }

  async findAll(payload: FindAllEmployeeDto) {
    const { role, department, keyword, ids, sort = 'createdAt', page = 1, limit = 10 } = payload;

    const filter: Record<string, any> = {};
    if (ids) filter._id = ids;
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (keyword) {
      const filterValue = new RegExp(keyword, 'i');
      filter.$or = [{ name: filterValue }, { email: filterValue }];
    }

    const options: PaginateOptions = {
      page,
      limit,
      sort,
      projection: '-password',
      populate: 'department',
      forceCountFn: true,
    };

    return await this.employeeModel.paginate(filter, options);
  }

  async findOne(id: string) {
    return await this.employeeModel.findById(id, '-password').populate('department').exec();
  }

  async delete(id: string) {
    return await this.employeeModel.findByIdAndUpdate(id, { deletedAt: new Date() }).exec();
  }
}
