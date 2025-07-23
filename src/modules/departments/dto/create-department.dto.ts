import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
}
