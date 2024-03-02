import { Model, Column, Table, DataType, HasMany } from 'sequelize-typescript';
import { Comment } from 'src/comment/comment.model';

@Table({ tableName: 'Users' })
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: 'userId', // указываем название поля в таблице
  })
  userId: number;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    field: 'userName', // указываем название поля в таблице
  })
  userName: string;

  @Column({
    type: DataType.STRING(128),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'email is in an invalid format',
      },
    },
    field: 'email', // указываем название поля в таблице
  })
  email: string;

  @Column({
    type: DataType.STRING(256),
    allowNull: true,
    field: 'homePage', // указываем название поля в таблице
  })
  homePage: string;

  @Column({
    type: DataType.STRING(256),
    allowNull: false,
    field: 'passwordHash', // указываем название поля в таблице
  })
  passwordHash: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'refreshToken', // указываем название поля в таблице
  })
  refreshToken: string;

  @HasMany(() => Comment, 'userId')
  comments: Comment[];

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'createdAt', // указываем название поля в таблице
  })
  createdAt: Date;
}
