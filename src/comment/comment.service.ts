import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from './comment.model';
import {
  IOptions,
  ISort,
  SortDirection,
  SortType,
} from './interfaces/comment.interface';
import { DEFAULT_SORT_BY, DEFAULT_SORT_DIRECT } from '../constants';
import { Sequelize, literal, Op } from 'sequelize';
import { GetCommentsDto } from './dto/getComment.dto';
import { AddCommentGrpcDto } from './dto/addComment.dto';

const defaultOrder: ISort = {
  sort: DEFAULT_SORT_BY,
  sortDirect: DEFAULT_SORT_DIRECT,
};

const commentAtt = [
  'commentId',
  'parentCommentId',
  'content',
  'fileName',
  'createdAt',
];

const userAtt = ['userName', 'email', 'homePage'];

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment) private readonly commentRepository: typeof Comment,
  ) {}
  // Services
  async getCommentService(dto: GetCommentsDto) {
    const sort = (dto.sort || DEFAULT_SORT_BY) as SortType;
    const sortDirect = (dto.sortDirect || DEFAULT_SORT_DIRECT) as SortDirection;
    const page = dto.page || 1;
    const limit = dto.limit || 25;
    const options = { limit, offset: (page - 1) * limit };
    const order = { sort, sortDirect };

    const comments = await this.getComments(options, order);
    const totalPages = await this.getTotalPage(limit);

    return { comments, totalPages };
  }

  async addCommentService(dto: AddCommentGrpcDto) {
    try {
      if (dto.parentCommentId) {
        await this.getComment({
          commentId: dto.parentCommentId,
        });
      }

      const body = {
        parentCommentId: dto.parentCommentId || null,
        content: dto.content,
        userId: dto.user.userId,
      };

      const comment = await this.addNewComment(body);

      //@ts-ignore
      comment.user = {
        userName: dto.user.userName,
        email: dto.user.email,
        homePage: dto.user.homePage,
      };
      return comment;
    } catch (error) {
      throw error;
    }
  }

  // Helpers
  async getTotalPage(limit: number) {
    const totalCount = await this.countComments();

    return Math.ceil(totalCount / limit);
  }

  async getComments(options: IOptions, order: ISort) {
    const comments = await this.findAllComments(null, options, order);

    for (const comment of comments) {
      comment.replies = await this.recursiveGetComments(comment);
    }

    return comments;
  }

  async recursiveGetComments(reply: Comment) {
    const nextReplies = await this.findAllComments(reply.commentId);

    for (const nextReply of nextReplies) {
      if (nextReply.replies.length) {
        for (const reply of nextReply.replies) {
          reply.replies = await this.recursiveGetComments(reply);
        }
      }
    }

    return nextReplies;
  }

  // Repository
  async addNewComment(body: any) {
    const comment = await this.commentRepository.create({
      ...body,
    });

    return comment.toJSON();
  }

  async getComment(where: object) {
    const comment = await this.commentRepository.findOne({
      where: { ...where },
      raw: true,
    });

    if (!comment) {
      throw new HttpException(
        'This comment does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    return comment;
  }

  async countComments() {
    const totalCount = await this.commentRepository.count({
      where: { parentCommentId: { [Op.is]: null } },
    });

    return totalCount;
  }

  async findAllComments(
    parentCommentId: number | null,
    options?: IOptions,
    { sort, sortDirect } = defaultOrder,
  ) {
    const currentOrder =
      sort !== DEFAULT_SORT_BY
        ? [literal(`"user"."${sort}"`), sortDirect]
        : [sort, sortDirect];

    const include = parentCommentId
      ? [
          {
            association: 'user',
            as: 'user',
            attributes: userAtt,
          },
          {
            association: 'replies',
            as: 'replies',
            attributes: commentAtt,
            required: false,
            include: [
              {
                association: 'user',
                as: 'user',
                attributes: userAtt,
              },
            ],
          },
        ]
      : [
          {
            association: 'user',
            as: 'user',
            attributes: userAtt,
          },
        ];

    const order = parentCommentId
      ? [currentOrder, [literal('"replies"."createdAt"'), 'DESC']]
      : [currentOrder];

    const comments = await this.commentRepository.findAll({
      attributes: commentAtt,
      where: { parentCommentId },
      ...options,
      include,
      //@ts-ignore
      order,
      subQuery: false,
    });

    if (!parentCommentId && !comments.length) {
      throw new HttpException('No comments found', HttpStatus.NOT_FOUND);
    }

    return comments.map((comment) => comment.get({ plain: true }));
  }
}
