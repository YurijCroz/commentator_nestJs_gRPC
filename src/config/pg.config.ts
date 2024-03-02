import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { User } from 'src/auth/user.model';
import { Comment } from 'src/comment/comment.model';

export const PgConfig: SequelizeModuleOptions = {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  autoLoadModels: true, // автоматическая загрузка моделей
  synchronize: true, // автоматическое создание таблиц при старте
  models: [User, Comment],
};
