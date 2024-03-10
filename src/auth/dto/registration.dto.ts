import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { AuthDto } from './auth.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegistrationDto extends AuthDto {
  @ApiProperty({ example: 'Kent', description: 'User name' })
  @IsString({ message: 'Should be a string' })
  @Length(2, 64, { message: 'No less than 2 and no more than 64' })
  @Matches(/^[a-zA-Zа-яА-Я]+$/gm, {
    message: 'Invalid userName format',
  })
  readonly userName: string;

  @ApiPropertyOptional({
    example: 'https://example.com/example',
    description: 'User home page',
  })
  @IsOptional()
  @IsString({ message: 'Should be a string' })
  @Length(10, 256, { message: 'Не меньше 10 и не больше 256' })
  @Matches(/^(http|https):\/\/[^\s\/$.?#].[^\s]*$/i, {
    message: 'Invalid homePage format',
  })
  readonly homePage: string;
}
