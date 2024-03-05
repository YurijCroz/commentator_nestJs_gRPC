import {
  IsOptional,
  IsNumber,
  IsString,
  Matches,
  IsPositive,
} from 'class-validator';

export class GetCommentsDto {
  @IsOptional()
  @IsNumber({}, { message: 'Limit should be a number' })
  @IsPositive({ message: 'Limit should be a positive number' })
  readonly limit?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Page should be a number' })
  @IsPositive({ message: 'Page should be a positive number' })
  readonly page?: number;

  @IsOptional()
  @IsString({ message: 'Sort should be a string' })
  @Matches(/^(email|userName|createdAt)$/, {
    message: 'Sort should be one of: email, userName, createdAt',
  })
  readonly sort?: string;

  @IsOptional()
  @IsString({ message: 'SortDirect should be a string' })
  @Matches(/^(ASC|DESC)$/, {
    message: 'SortDirect should be one of: ASC, DESC',
  })
  readonly sortDirect?: string;
}
