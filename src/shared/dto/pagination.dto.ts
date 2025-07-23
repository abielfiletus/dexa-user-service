import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ required: false, default: 10 })
  @ValidateIf(({ value }) => !!value)
  @IsNumber({ allowNaN: false })
  @Min(0)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ required: false, default: 1 })
  @ValidateIf(({ value }) => !!value)
  @IsNumber({ allowNaN: false })
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sort?: string;
}
