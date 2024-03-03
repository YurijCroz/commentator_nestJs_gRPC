import {
  IsOptional,
  IsNumber,
  IsString,
  Matches,
  IsPositive,
} from 'class-validator';

export class AddCommentDto {
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Parent comment ID should be a positive number' })
  readonly parentCommentId: number;

  @IsString({ message: 'Should be a string' })
  @Matches(/[^ ]+/i, {
    message: 'Invalid text format',
  })
  readonly content: string;
}
