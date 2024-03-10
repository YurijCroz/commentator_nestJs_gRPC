import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  @IsJWT()
  readonly refreshToken: string;
}
