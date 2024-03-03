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
import { AddCommentDto } from './dto/addComment.dto';
import { CommentService } from './comment.service';

interface CustomRequest extends Request {
  user: {
    userId: number;
    userName: string;
    email: string;
    homePage: string;
  };
}

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

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
