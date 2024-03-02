import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { PgConfig } from './config/pg.config';

@Module({
  imports: [AuthModule, SequelizeModule.forRoot(PgConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
