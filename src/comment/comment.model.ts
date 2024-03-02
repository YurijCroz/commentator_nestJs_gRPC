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
    field: 'commentId',
  })
  commentId: number;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    field: 'parentCommentId',
  })
  parentCommentId: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'content',
  })
  content: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
    field: 'fileName',
  })
  fileName: string;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
    field: 'userId',
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
    field: 'createdAt',
  })
  createdAt: Date;
}
