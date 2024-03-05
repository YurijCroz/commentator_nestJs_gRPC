import {
  Body,
  Controller,
  Get,
  Post,
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
  async getCommentGRPC(dto: object) {
    return dto;
  }

  // REST
  @Get('getComments')
  async getComments() {}

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
