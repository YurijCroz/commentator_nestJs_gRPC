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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddCommentDto, AddCommentGrpcDto } from './dto/addComment.dto';
import { CommentService } from './comment.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { JwtGrpcGuard } from '../auth/jwt-grpc-auth.guard';
import { GrpcValidationPipe } from '../pipes/grpc-validation.pipe';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { GetCommentsDto } from './dto/getComment.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiResponseProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Comment } from './comment.model';

interface IUser {
  userId: number;
  userName: string;
  email: string;
  homePage: string;
}

interface CustomRequest extends Request {
  user: IUser;
}

export class CommentResponse {
  @ApiResponseProperty({ example: 1 })
  totalPages: number;

  @ApiResponseProperty({ type: [Comment] })
  comments: Comment[];
}

@ApiTags('Comments')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // gRPC
  @GrpcMethod('CommentsService', 'AddComment')
  @UseGuards(JwtGrpcGuard)
  @UsePipes(new GrpcValidationPipe())
  async addCommentGRPC(dto: AddCommentGrpcDto) {
    try {
      return await this.commentService.addCommentService(dto);
    } catch (error) {
      throw new RpcException({ code: Status.INVALID_ARGUMENT });
    }
  }

  @GrpcMethod('CommentsService', 'GetComments')
  @UsePipes(new GrpcValidationPipe())
  async getCommentGRPC(dto: GetCommentsDto) {
    return await this.commentService.getCommentService(dto);
  }

  // REST
  @ApiOperation({ summary: 'Get comments' })
  @ApiResponse({ status: 200, type: CommentResponse })
  @Get('getComments')
  async getComments(@Query() dto: GetCommentsDto) {
    return await this.commentService.getCommentService(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment' })
  @ApiResponse({ status: 201, type: Comment })
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @Post('addComment')
  async addComment(@Req() req: CustomRequest, @Body() dto: AddCommentDto) {
    const queryData: AddCommentGrpcDto = {
      ...dto,
      user: req.user,
    };

    return await this.commentService.addCommentService(queryData);
  }
}
