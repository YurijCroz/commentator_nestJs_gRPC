import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from './comment.model';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment) private readonly commentRepository: typeof Comment,
  ) {}

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
}
