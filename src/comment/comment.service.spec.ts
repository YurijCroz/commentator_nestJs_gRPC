import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepositoryMock: any;

  beforeEach(async () => {
    commentRepositoryMock = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: 'CommentRepository', useValue: commentRepositoryMock },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  describe('getTotalPage', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

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
});
