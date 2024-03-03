import { IsJWT } from 'class-validator';

export class RefreshDto {
  @IsJWT()
  readonly refreshToken: string;
}
