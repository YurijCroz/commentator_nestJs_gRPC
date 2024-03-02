import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { PgConfig } from './config/pg.config';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [AuthModule, CommentModule, SequelizeModule.forRoot(PgConfig)],
  controllers: [],
  providers: [],
})
export class AppModule {}
