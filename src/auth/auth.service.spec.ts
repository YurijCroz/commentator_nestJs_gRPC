import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepositoryMock: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    userRepositoryMock = {
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        AuthService,
        { provide: 'UserRepository', useValue: userRepositoryMock },
        JwtService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('getNewTokenPair & generateToken - generate really token', () => {
    it('should return a new token pair', async () => {
      const user = {
        email: 'test@test.com',
        userId: 1,
        userName: 'TestName',
        homePage: 'https://test.com',
      };

      //@ts-ignore
      jest.spyOn(service, 'updateUserById').mockResolvedValue(true);

      //@ts-ignore
      const { accessToken, refreshToken } = await service.getNewTokenPair(user);

      const { iat, exp, ...accessTokenUser } = jwtService.verify(accessToken, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      const {
        iat: iatR,
        exp: expR,
        ...refreshTokenUser
      } = jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(accessTokenUser).toEqual(user);
      expect(refreshTokenUser).toEqual(user);
    });

    it('should return a new token pair - no extra keys', async () => {
      const user = {
        email: 'test@test.com',
        userId: 1,
        userName: 'TestName',
        homePage: 'https://test.com',
        // no extra keys
        password: '$2a$10$aTwhPWLqLjXmcfxH/D6VrefJz6BN7C1tvVilTFFM0S',
        refreshToken: 'exampleRefreshToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      //@ts-ignore
      jest.spyOn(service, 'updateUserById').mockResolvedValue(true);

      //@ts-ignore
      const { accessToken, refreshToken } = await service.getNewTokenPair(user);

      const { iat, exp, ...accessTokenUser } = jwtService.verify(accessToken, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      const {
        iat: iatR,
        exp: expR,
        ...refreshTokenUser
      } = jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const {
        password,
        refreshToken: _r,
        createdAt,
        updatedAt,
        ...expectedUser
      } = user;

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(accessTokenUser).not.toEqual(user);
      expect(refreshTokenUser).not.toEqual(user);
      expect(accessTokenUser).toEqual(expectedUser);
      expect(refreshTokenUser).toEqual(expectedUser);
    });
  });

  describe('updateUserById', () => {
    it('should return a update user', async () => {
      const body = {
        userName: 'TestName',
        password: '$2a$10$aTwhPWLqLjXmcfxH/D6VrefJz6BN7C1tvVilTFFM0S',
      };
      const expectedUser = {
        email: 'test@test.com',
        userId: 1,
        userName: 'TestName',
        homePage: 'https://test.com',
        password: '$2a$10$aTwhPWLqLjXmcfxH/D6VrefJz6BN7C1tvVilTFFM0S',
        refreshToken: 'exampleRefreshToken',
      };

      userRepositoryMock.update.mockResolvedValue([1, [expectedUser]]);

      const updatedUser = await service.updateUserById(
        expectedUser.userId,
        body,
      );

      expect(updatedUser).toEqual(expectedUser);
    });

    it('should throw an error if updatedCount is 0', async () => {
      userRepositoryMock.update.mockResolvedValue([0, []]);
      try {
        await service.updateUserById(1, {});

        fail('Expected updateUserPromise to throw an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.message).toBe('cannot update user');
      }
    });
  });

  describe('passwordCompare & passwordHash', () => {
    it('should return true', async () => {
      const pass = 'TESTter88';
      const hashPassword = await service.passwordHash(pass);
      expect(pass).not.toBe(hashPassword);

      const result = await service.passwordCompare(pass, hashPassword);

      expect(result).toBeTruthy();
      expect(result).toBe(true);
    });

    it('should catch error', async () => {
      try {
        const pass = 'TESTter88';
        const hashPassword = await service.passwordHash(pass);
        expect(pass).not.toBe(hashPassword);

        await service.passwordCompare('1234', hashPassword);

        fail('Expected passwordCompare to throw an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Invalid email or password');
      }
    });
  });
});
