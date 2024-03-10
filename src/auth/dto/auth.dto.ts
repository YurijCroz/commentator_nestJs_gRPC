import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Unique e-mail address',
  })
  @IsString({ message: 'Should be a string' })
  @Length(5, 128, { message: 'No less than 5 and no more than 128' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @ApiProperty({ example: 'PASSword88', description: 'password' })
  @IsString({ message: 'Should be a string' })
  @Length(8, 32, { message: 'No less than 8 and no more than 32' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: 'Invalid password format',
  })
  readonly password: string;
}
