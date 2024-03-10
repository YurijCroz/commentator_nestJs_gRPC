import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddCommentDto, AddCommentGrpcDto } from './dto/addComment.dto';
import { CommentService } from './comment.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { JwtGrpcGuard } from 'src/auth/jwt-grpc-auth.guard';
import { GrpcValidationPipe } from 'src/pipes/grpc-validation.pipe';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { GetCommentsDto } from './dto/getComment.dto';
import { DEFAULT_SORT_BY, DEFAULT_SORT_DIRECT } from 'src/constants';
import { SortDirection, SortType } from './interfaces/comment.interface';

interface IUser {
  userId: number;
  userName: string;
  email: string;
  homePage: string;
}
interface CustomRequest extends Request {
  user: IUser;
}

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // gRPC
  @GrpcMethod('CommentsService', 'AddComment')
  @UseGuards(JwtGrpcGuard)
  @UsePipes(new GrpcValidationPipe())
  async addCommentGRPC(dto: AddCommentGrpcDto) {
    try {
      if (dto.parentCommentId) {
        await this.commentService.getComment({
          commentId: dto.parentCommentId,
        });
      }

      const body = {
        parentCommentId: dto.parentCommentId || null,
        content: dto.content,
        userId: dto.user.userId,
      };

      const comment = await this.commentService.addNewComment(body);

      //@ts-ignore
      comment.user = {
        userName: dto.user.userName,
        email: dto.user.email,
        homePage: dto.user.homePage,
      };

      return comment;
    } catch (error) {
      throw new RpcException({ code: Status.INVALID_ARGUMENT });
    }
  }

  @GrpcMethod('CommentsService', 'GetComments')
  @UsePipes(new GrpcValidationPipe())
  async getCommentGRPC(dto: GetCommentsDto) {
    const sort = (dto.sort || DEFAULT_SORT_BY) as SortType;
    const sortDirect = (dto.sortDirect || DEFAULT_SORT_DIRECT) as SortDirection;
    const page = dto.page || 1;
    const limit = dto.limit || 25;
    const options = { limit, offset: (page - 1) * limit };
    const order = { sort, sortDirect };

    const comments = await this.commentService.getComments(options, order);
    const totalPages = await this.commentService.getTotalPage(limit);

    return { comments, totalPages };
  }

  // REST
  @Get('getComments')
  async getComments(@Query() dto: GetCommentsDto) {
    const sort = (dto.sort || DEFAULT_SORT_BY) as SortType;
    const sortDirect = (dto.sortDirect || DEFAULT_SORT_DIRECT) as SortDirection;
    const page = dto.page || 1;
    const limit = dto.limit || 25;
    const options = { limit, offset: (page - 1) * limit };
    const order = { sort, sortDirect };

    const comments = await this.commentService.getComments(options, order);
    const totalPages = await this.commentService.getTotalPage(limit);

    return { comments, totalPages };
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @Post('addComment')
  async addComment(@Req() req: CustomRequest, @Body() dto: AddCommentDto) {
    if (dto.parentCommentId) {
      await this.commentService.getComment({ commentId: dto.parentCommentId });
    }

    const body = {
      parentCommentId: dto.parentCommentId || null,
      content: dto.content,
      userId: req.user.userId,
    };

    const comment = await this.commentService.addNewComment(body);

    //@ts-ignore
    comment.user = {
      userName: req.user.userName,
      email: req.user.email,
      homePage: req.user.homePage,
    };

    return comment;
  }
}
