import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Department } from '../../departments/schemas/department.schemas';
import * as paginator from 'mongoose-paginate-v2';

@Schema({ timestamps: true, toJSON: { getters: true }, toObject: { getters: true } })
export class Employee extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phone_number: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    get(value: string) {
      return process.env.FILE_URL + value;
    },
  })
  photo: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: Department.name,
    required: true,
  })
  department: Types.ObjectId | Department;

  @Prop({ required: true, index: true })
  role: string;

  @Prop()
  deletedAt: Date;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

EmployeeSchema.plugin(paginator);
