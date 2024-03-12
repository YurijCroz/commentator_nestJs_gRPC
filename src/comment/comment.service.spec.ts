import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepositoryMock: any;

  beforeEach(async () => {
    commentRepositoryMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: 'CommentRepository', useValue: commentRepositoryMock },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  describe('getTotalPage', () => {
    it('should return the correct total page count (fixed)', async () => {
      const totalCount = 20;
      const limit = 5;
      const expectedTotalPage = 4;

      jest.spyOn(service, 'countComments').mockResolvedValue(totalCount);

      const result = await service.getTotalPage(limit);

      expect(result).toEqual(expectedTotalPage);
    });

    it('should return the correct total page count (random one time)', async () => {
      const totalCount =
        Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1;
      const limit = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1;
      const expectedTotalPage = Math.ceil(totalCount / limit);

      jest.spyOn(service, 'countComments').mockResolvedValue(totalCount);

      const result = await service.getTotalPage(limit);

      expect(result).toEqual(expectedTotalPage);
    });

    it('should return the correct total page count (random cycle 10 times)', async () => {
      for (let i = 0; i < 10; i++) {
        const totalCount =
          Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1;
        const limit = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1;
        const expectedTotalPage = Math.ceil(totalCount / limit);

        jest.spyOn(service, 'countComments').mockResolvedValue(totalCount);

        const result = await service.getTotalPage(limit);

        expect(result).toEqual(expectedTotalPage);
      }
    });
  });

  describe('addCommentService', () => {
    it('should return a comment when addCommentService is called', async () => {
      const fakeComment = {
        content: 'Test comment',
        parentCommentId: null,
      };
      const fakeUser = {
        userId: 1,
        userName: 'TestName',
        email: 'test@test.com',
        homePage: 'https://test.com',
      };
      const mockComment = {
        ...fakeComment,
        commentId: 1,
        fileName: null,
        createdAt: new Date(),
        userId: 1,
      };
      const expectedComment = {
        ...mockComment,
        user: { ...fakeUser },
      };

      //@ts-ignore
      jest.spyOn(service, 'addNewComment').mockResolvedValue(mockComment);

      const result = await service.addCommentService({
        ...fakeComment,
        user: fakeUser,
      });
      //@ts-ignore
      delete expectedComment.user.userId;

      expect(result).toEqual(expectedComment);
    });

    it('should return a sub comment when addCommentService is called', async () => {
      const fakeComment = {
        content: 'Test comment',
        parentCommentId: 1,
      };
      const fakeUser = {
        userId: 1,
        userName: 'TestName',
        email: 'test@test.com',
        homePage: 'https://test.com',
      };
      const mockComment = {
        ...fakeComment,
        commentId: 2,
        fileName: null,
        createdAt: new Date(),
        userId: 1,
      };
      const expectedComment = {
        ...mockComment,
        user: { ...fakeUser },
      };
      const mockParentComment = {
        ...mockComment,
        commentId: 1,
        parentCommentId: null,
      };

      commentRepositoryMock.findOne.mockResolvedValue(mockParentComment);
      //@ts-ignore
      jest.spyOn(service, 'addNewComment').mockResolvedValue(mockComment);

      const result = await service.addCommentService({
        ...fakeComment,
        user: fakeUser,
      });
      //@ts-ignore
      delete expectedComment.user.userId;

      expect(result).toEqual(expectedComment);
    });
  });

  describe('getComment', () => {
    it('should return a comment', async () => {
      const mockComment = {
        content: 'Test comment',
        parentCommentId: null,
        commentId: 1,
        fileName: null,
        createdAt: new Date(),
        userId: 1,
      };

      commentRepositoryMock.findOne.mockResolvedValue(mockComment);

      const comment = await service.getComment({ commentId: 1 });

      expect(comment).toEqual(mockComment);
    });

    it('should return a error', async () => {
      commentRepositoryMock.findOne.mockResolvedValue(null);
      try {
        await service.getComment({ commentId: 1 });

        fail('Expected getCommentPromise to throw an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('This comment does not exist');
      }
    });
  });
});
