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
import { GrpcValidationPipe } from '../pipes/grpc-validation.pipe';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ISuccess, Success, TokenPair } from './interfaces/response.interfaces';

@ApiTags('Auth users')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // gRPC
  @GrpcMethod('UsersService', 'RegistrationUser')
  @UsePipes(new GrpcValidationPipe())
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
  @UsePipes(new GrpcValidationPipe())
  async loginGRPC(dto: AuthDto) {
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
  @UsePipes(new GrpcValidationPipe())
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
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, type: Success })
  @Post('registration')
  @UsePipes(new ValidationPipe())
  async registration(@Body() dto: RegistrationDto): Promise<ISuccess> {
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

  @ApiOperation({ summary: 'User login | to get a pair of tokens' })
  @ApiResponse({ status: 200, type: TokenPair })
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

  @ApiOperation({ summary: 'refresh tokens | to get a new pair of tokens' })
  @ApiResponse({ status: 200, type: TokenPair })
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
