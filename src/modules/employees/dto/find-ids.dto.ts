import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FindIdsDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  keyword: string;
}
