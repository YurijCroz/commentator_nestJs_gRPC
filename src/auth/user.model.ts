import { Model, Column, Table, DataType, HasMany } from 'sequelize-typescript';
import { Comment } from 'src/comment/comment.model';

interface UserCreationAttrs {
  email: string;
  password: string;
  userName: string;
  homePage?: string;
}
@Table({ tableName: 'Users' })
export class User extends Model<User, UserCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: 'userId',
  })
  userId: number;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    field: 'userName',
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
    field: 'email',
  })
  email: string;

  @Column({
    type: DataType.STRING(256),
    allowNull: true,
    field: 'homePage',
  })
  homePage: string;

  @Column({
    type: DataType.STRING(256),
    allowNull: false,
    field: 'password',
  })
  password: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'refreshToken',
  })
  refreshToken: string;

  @HasMany(() => Comment, 'userId')
  comments: Comment[];

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'createdAt',
  })
  createdAt: Date;
}
