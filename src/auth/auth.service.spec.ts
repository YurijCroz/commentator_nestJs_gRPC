import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepositoryMock: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    userRepositoryMock = {};

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
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

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
});
