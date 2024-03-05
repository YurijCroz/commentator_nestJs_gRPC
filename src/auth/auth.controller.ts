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
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { Status } from '@grpc/grpc-js/build/src/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // gRPC
  @GrpcMethod('UsersService', 'RegistrationUser')
  async registrationGRPC(dto: RegistrationDto) {
    const candidate = await this.authService.getUser({ email: dto.email });
    if (candidate) {
      throw new RpcException({ code: Status.ALREADY_EXISTS });
    }
    const newUser = await this.authService.addUser(dto);
    if (!newUser) {
      throw new RpcException({ code: Status.INTERNAL });
    }
    return { message: 'success' };
  }

  @GrpcMethod('UsersService', 'LoginUser')
  async loginGRPC(dto: AuthDto) {
    console.log(dto);
    const user = await this.authService.getUser({ email: dto.email });
    if (!user) {
      throw new RpcException({ code: Status.NOT_FOUND });
    }
    try {
      await this.authService.passwordCompare(dto.password, user.password);
      const tokenPair = await this.authService.getNewTokenPair(user);
      return { tokenPair };
    } catch (error) {
      throw new RpcException({ code: Status.INVALID_ARGUMENT });
    }
  }

  @GrpcMethod('UsersService', 'RefreshToken')
  async refreshGRPC(dto: RefreshDto) {
    const user = await this.authService.getUser({
      refreshToken: dto.refreshToken,
    });
    if (!user) {
      throw new RpcException({ code: Status.INVALID_ARGUMENT });
    }
    const tokenPair = await this.authService.getNewTokenPair(user);
    return { tokenPair };
  }

  // REST
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
