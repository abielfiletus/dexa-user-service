import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsNotEmpty, IsPhoneNumber, ValidateIf } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @ValidateIf(({ value }) => !!value)
  @IsPhoneNumber('ID')
  phone_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  department: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  photo: Express.Multer.File;

  password: string;
  role: string;
}
