import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { PgConfig } from './config/pg.config';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [AuthModule, CommentModule, SequelizeModule.forRoot(PgConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
