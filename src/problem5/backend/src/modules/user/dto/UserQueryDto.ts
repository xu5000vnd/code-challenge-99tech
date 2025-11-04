import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../base/dto/PaginationDto';

export class UserQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;
}
