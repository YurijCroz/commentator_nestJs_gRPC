import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { RegistrationDto } from '../src/auth/dto/registration.dto';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { faker } from '@faker-js/faker';
import { User } from '../src/auth/user.model';
import { Comment } from '../src/comment/comment.model';

const loginUser: AuthDto = {
  email: 'super-test@gmail.com',
  password: 'DRAGster88',
};

const registrationUser: RegistrationDto = {
  ...loginUser,
  userName: 'SuperTest',
  homePage: 'https://github.com/SuperTest',
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userId: number;
  let accessToken: string;
  let refreshToken: string;
  let commentId: number;
  let totalPages: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/registration (POST) success', async (/* done */) => {
    return request(app.getHttpServer())
      .post('/auth/registration')
      .send(registrationUser)
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body.message).toBe('success');
        // done();
      });
  });

  it('/auth/registration (POST) failed', () => {
    return request(app.getHttpServer())
      .post('/auth/registration')
      .send(registrationUser)
      .expect(400);
  });

  it('/auth/login (POST) success', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginUser)
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body).toHaveProperty('tokenPair');
        expect(body.tokenPair).toHaveProperty('accessToken');
        expect(body.tokenPair).toHaveProperty('refreshToken');
        accessToken = body.tokenPair.accessToken;
        refreshToken = body.tokenPair.refreshToken;
      });
  });

  it('/auth/login (POST) invalid login or password - failed', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@mail.com', password: 'DRAGster123' })
      .expect(404);
  });

  it('/auth/refresh (POST) - success', async () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body).toHaveProperty('tokenPair');
        expect(body.tokenPair).toHaveProperty('accessToken');
        expect(body.tokenPair).toHaveProperty('refreshToken');
        accessToken = body.tokenPair.accessToken;
        refreshToken = body.tokenPair.refreshToken;
      });
  });

  it('/auth/refresh (POST) validated, incorrect token - failed', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: accessToken })
      .expect(400, {
        statusCode: 400,
        message: 'need refresh token',
      });
  });

  it('/auth/refresh (POST) unverified - failed', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'a' })
      .expect(400, {
        message: ['refreshToken must be a jwt string'],
        error: 'Bad Request',
        statusCode: 400,
      });
  });

  it('/comment/addComment (POST) first comment - success', async () => {
    const content = faker.lorem.text();
    return request(app.getHttpServer())
      .post('/comment/addComment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content })
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body.commentId).toBeDefined();
        expect(body.content).toBe(content);
        expect(body.user.email).toBe(loginUser.email);
        userId = body.userId;
        commentId = body.commentId;
      });
  });

  it('/comment/addComment (POST) validation - failed', async () => {
    return request(app.getHttpServer())
      .post('/comment/addComment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: '' })
      .expect(400, {
        error: 'Bad Request',
        message: ['Invalid text format'],
        statusCode: 400,
      });
  });

  it('/comment/addComment (POST) Unauthorized - failed', async () => {
    return request(app.getHttpServer())
      .post('/comment/addComment')
      .send({ content: 'Need token' })
      .expect(401, {
        // error: 'Unauthorized',
        // statusCode: 401,
        message: 'User not authorized',
      });
  });

  it('/comment/addComment (POST) sub comments - success', async () => {
    for (let i = 0; i < 10; i++) {
      const content = faker.lorem.text();
      await request(app.getHttpServer())
        .post('/comment/addComment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content, parentCommentId: commentId })
        .expect(201)
        .then(({ body }: request.Response) => {
          expect(body.commentId).toBeDefined();
          expect(body.content).toBe(content);
          commentId = body.commentId;
        });
    }
  });

  it('/comment/addComment (POST) many comment - success', async () => {
    const content = faker.lorem.text();
    for (let i = 0; i < 10; i++) {
      return request(app.getHttpServer())
        .post('/comment/addComment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content })
        .expect(201)
        .then(({ body }: request.Response) => {
          expect(body.commentId).toBeDefined();
          expect(body.content).toBe(content);
          expect(body.user.email).toBe(loginUser.email);
        });
    }
  });

  it('/comment/getComments (GET) sort default DESC - success', async () => {
    return request(app.getHttpServer())
      .get('/comment/getComments')
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body.totalPages).toBeGreaterThan(0);
        const comments = JSON.parse(JSON.stringify(body.comments));
        const sortComments = comments.sort(
          (a: Comment, b: Comment) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        expect(body.comments).toEqual(sortComments);
      });
  });

  it('/comment/getComments (GET) sort ASC - success', async () => {
    return request(app.getHttpServer())
      .get('/comment/getComments')
      .query({ sortDirect: 'ASC' })
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body.totalPages).toBeGreaterThan(0);
        const comments = JSON.parse(JSON.stringify(body.comments));
        const sortComments = comments.sort(
          (a: Comment, b: Comment) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        expect(body.comments).toEqual(sortComments);
        totalPages = body.totalPages;
      });
  });

  it('/comment/getComments (GET) page not found - failed', async () => {
    return request(app.getHttpServer())
      .get('/comment/getComments')
      .query({ page: totalPages + 1 })
      .expect(404, {
        statusCode: 404,
        message: 'No comments found',
      });
  });

  afterAll(async () => {
    await Comment.destroy({
      where: {
        userId: userId,
      },
    });

    await User.destroy({
      where: {
        userId: userId,
      },
    });
  });
});
