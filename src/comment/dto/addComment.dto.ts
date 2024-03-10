import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  Matches,
  IsPositive,
} from 'class-validator';

export class AddCommentDto {
  @ApiPropertyOptional({ example: 1, description: 'Parent comment ID' })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Parent comment ID should be a positive number' })
  readonly parentCommentId: number;

  @ApiProperty({ example: 'Text content' })
  @IsString({ message: 'Should be a string' })
  @Matches(/[^ ]+/i, {
    message: 'Invalid text format',
  })
  readonly content: string;
}

export class AddCommentGrpcDto extends AddCommentDto {
  user: {
    userId: number;
    userName: string;
    email: string;
    homePage: string;
  };
}
