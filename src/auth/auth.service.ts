import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.model';
import { InjectModel } from '@nestjs/sequelize';
import { RegistrationDto } from './dto/registration.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userRepository: typeof User,
    private jwtService: JwtService,
  ) {}

  async getUser(where: object) {
    const user = await this.userRepository.findOne({
      where: { ...where },
    });
    return user;
  }

  async addUser(body: RegistrationDto) {
    const user = this.userRepository.create({
      email: body.email,
      userName: body.userName,
      password: await this.passwordHash(body.password),
      homePage: body.homePage,
    });

    return user;
  }

  async updateUserById(id: number, body: object) {
    const [updatedCount, [updatedUser]] = await this.userRepository.update(
      body,
      {
        where: { userId: id },
        returning: true,
      },
    );

    if (updatedCount < 1) {
      throw new HttpException(
        'cannot update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedUser;
  }

  async passwordHash(pass: string) {
    return await bcrypt.hash(pass, Number(process.env.SALT_ROUNDS));
  }

  async passwordCompare(pass1: string, pass2: string) {
    const passwordCompare = await bcrypt.compare(pass1, pass2);

    if (!passwordCompare) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.NOT_FOUND,
      );
    }

    return passwordCompare;
  }

  async getNewTokenPair(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateToken(
      user,
      Number(process.env.ACCESS_TOKEN_TIME),
      process.env.ACCESS_TOKEN_SECRET!,
    );

    const refreshToken = await this.generateToken(
      user,
      process.env.REFRESH_TOKEN_TIME!,
      process.env.REFRESH_TOKEN_SECRET!,
    );

    await this.updateUserById(user.userId, {
      refreshToken: refreshToken,
    });

    return { accessToken, refreshToken };
  }

  private async generateToken(
    user: User,
    time: string | number,
    secret: string,
  ): Promise<string> {
    const payload = {
      email: user.email,
      userId: user.userId,
      userName: user.userName,
      homePage: user.homePage,
    };

    return this.jwtService.sign(payload, {
      expiresIn: time,
      secret: secret,
    });
  }
}
