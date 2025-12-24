import { UserMapper } from '@/modules/user/mappers/user.mapper';
import { Comments } from '../domain/comment';
import { CommentSchemaClass } from '../entities/comment.schema';
import { PostMapper } from '@/modules/post/mappers/post.mapper';

export class CommentMapper {
  static toDomain(raw: any): Comments {
    const comment = new Comments();

    if (raw.parent) {
      comment.parent = this.toDomain(raw.parent);
    }

    comment.id = raw._id.toString();
    comment.content = raw.content;
    comment.user = UserMapper.toDomain(raw.user);
    comment.post = PostMapper.toDomain(raw.post);
    comment.createdAt = raw.createdAt;
    comment.updatedAt = raw.updatedAt;
    comment.deletedAt = raw.deletedAt;
    return comment;
  }

  static toPersistence(domain: Comments): CommentSchemaClass {
    const comment = new CommentSchemaClass();

    if (domain.parent) {
      comment.parent = this.toPersistence(domain.parent);
    }

    comment._id = domain.id;
    comment.content = domain.content;
    comment.user = UserMapper.toPersistence(domain.user);
    comment.post = PostMapper.toPersistence(domain.post);
    comment.createdAt = domain.createdAt;
    comment.updatedAt = domain.updatedAt;
    comment.deletedAt = domain.deletedAt;
    return comment;
  }
}
