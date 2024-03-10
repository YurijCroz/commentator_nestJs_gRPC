import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsString,
  Matches,
  IsPositive,
} from 'class-validator';

export class GetCommentsDto {
  @ApiPropertyOptional({
    example: 25,
    description: 'Limit of title comments, default 25',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Limit should be a number' })
  @IsPositive({ message: 'Limit should be a positive number' })
  readonly limit?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Page to display, defaults to 1 based on the limit value',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Page should be a number' })
  @IsPositive({ message: 'Page should be a positive number' })
  readonly page?: number;

  @ApiPropertyOptional({
    example: 'userName',
    description:
      'Sort column: email, userName or createdAt. By default createdAt',
  })
  @IsOptional()
  @IsString({ message: 'Sort should be a string' })
  @Matches(/^(email|userName|createdAt)$/, {
    message: 'Sort should be one of: email, userName, createdAt',
  })
  readonly sort?: string;

  @ApiPropertyOptional({
    example: 'ASC',
    description: 'Sort direction: ASC or DESC. Default DESC',
  })
  @IsOptional()
  @IsString({ message: 'SortDirect should be a string' })
  @Matches(/^(ASC|DESC)$/, {
    message: 'SortDirect should be one of: ASC, DESC',
  })
  readonly sortDirect?: string;
}
