import { ApiResponseProperty } from '@nestjs/swagger';

class Token {
  @ApiResponseProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiResponseProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

export class TokenPair {
  @ApiResponseProperty({ type: Token })
  tokenPair: Token;
}

export interface ISuccess {
  message: 'success';
}
export class Success {
  @ApiResponseProperty({ example: 'success' })
  message: 'success';
}
