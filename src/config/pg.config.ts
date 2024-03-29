import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { User } from '../auth/user.model';
import { Comment } from '../comment/comment.model';

export const PgConfig: SequelizeModuleOptions = {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  synchronize: true, // автоматическое создание таблиц при старте
  autoLoadModels: true, // автоматическая загрузка моделей
  models: [User, Comment],
  logging: false,
};
