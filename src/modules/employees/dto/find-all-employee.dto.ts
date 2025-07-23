import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsMongoId, IsOptional, ValidateIf } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class FindAllEmployeeDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  keyword: string;

  @ApiProperty({ required: false })
  @IsOptional()
  department: string;

  @ApiProperty({ required: false })
  @IsOptional()
  role: string;

  @ApiProperty({ required: false })
  @ValidateIf(({ value }) => !!value)
  @IsArray()
  @ArrayMaxSize(50)
  @IsMongoId({ each: true })
  ids: string[];
}
