import {
  Model,
  Column,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from 'src/auth/user.model';

@Table({ tableName: 'Comments' })
export class Comment extends Model<Comment> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: 'commentId', // указываем название поля в таблице
  })
  commentId: number;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    field: 'parentCommentId', // указываем название поля в таблице
  })
  parentCommentId: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'content', // указываем название поля в таблице
  })
  content: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
    field: 'fileName', // указываем название поля в таблице
  })
  fileName: string;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
    field: 'userId', // указываем название поля в таблице
  })
  userId: number;

  @BelongsTo(() => User, 'userId')
  user: User;

  @HasMany(() => Comment, 'parentCommentId')
  replies: Comment[];

  @BelongsTo(() => Comment, 'parentCommentId')
  parentComment: Comment;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'createdAt', // указываем название поля в таблице
  })
  createdAt: Date;
}
