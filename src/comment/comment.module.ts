import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from './comment.model';
import { User } from 'src/auth/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Comment, User]), JwtModule],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
