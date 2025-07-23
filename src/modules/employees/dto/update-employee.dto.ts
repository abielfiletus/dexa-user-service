import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsOptional, IsPhoneNumber, ValidateIf } from 'class-validator';

export class UpdateEmployeeDto {
  @ApiProperty({ required: false })
  @IsOptional()
  name: string;

  @ApiProperty({ required: false })
  @ValidateIf(({ value }) => !!value)
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @ValidateIf(({ value }) => !!value)
  @IsPhoneNumber('ID')
  phone_number: string;

  @ApiProperty({ required: false })
  @ValidateIf(({ value }) => !!value)
  @IsMongoId()
  department: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photo: Express.Multer.File;
}
