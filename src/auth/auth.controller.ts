import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { RegistrationDto } from './dto/registration.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  @UsePipes(new ValidationPipe())
  async registration(@Body() dto: RegistrationDto) {
    const candidate = await this.authService.getUser({ email: dto.email });
    if (candidate) {
      throw new HttpException(
        'a user with this email exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = await this.authService.addUser(dto);
    if (!newUser) {
      throw new HttpException('error :=(', 500);
    }

    return { message: 'success' };
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() dto: AuthDto) {
    const user = await this.authService.getUser({ email: dto.email });

    if (!user) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.authService.passwordCompare(dto.password, user.password);

    const tokenPair = await this.authService.getNewTokenPair(user);

    return { tokenPair };
  }

  @Post('refresh')
  @UsePipes(new ValidationPipe())
  async refresh(@Body() dto: RefreshDto) {
    const user = await this.authService.getUser({
      refreshToken: dto.refreshToken,
    });

    if (!user) {
      throw new HttpException('need refresh token', HttpStatus.BAD_REQUEST);
    }

    const tokenPair = await this.authService.getNewTokenPair(user);

    return { tokenPair };
  }
}
