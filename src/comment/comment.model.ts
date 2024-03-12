import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
import {
  Model,
  Column,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../auth/user.model';

@Table({ tableName: 'Comments' })
export class Comment extends Model<Comment> {
  @ApiProperty({ example: '1', description: 'Unique ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: 'commentId',
  })
  commentId: number;

  @ApiPropertyOptional({ example: '1', description: 'Unique ID or Null' })
  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    field: 'parentCommentId',
  })
  parentCommentId: number | null;

  @ApiProperty({ example: 'Text content' })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'content',
  })
  content: string;

  @ApiPropertyOptional({ example: 'file-name.webp' })
  @Column({
    type: DataType.STRING(64),
    allowNull: true,
    field: 'fileName',
  })
  fileName: string | null;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
    field: 'userId',
  })
  userId: number;

  @ApiResponseProperty({ type: () => User })
  @BelongsTo(() => User, 'userId')
  user: User;

  @ApiResponseProperty({
    type: 'array',
    example: ['/* Nested comments */'],
  })
  @HasMany(() => Comment, 'parentCommentId')
  replies: Comment[];

  @BelongsTo(() => Comment, 'parentCommentId')
  parentComment: Comment | undefined;

  @ApiProperty({ example: new Date() })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'createdAt',
  })
  createdAt: Date;
}
