import { Post } from '../domain/post';
import { PostSchemaClass } from '../entities/post.schema';
import { UserMapper } from '@/modules/user/mappers/user.mapper';
import { FileMapper } from '@/modules/file/mappers/file.mapper';
import { TagMapper } from '@/modules/tag/mapper/tag.mapper';

export class PostMapper {
  static toDomain(raw: PostSchemaClass): Post {
    const domainEntity = new Post();
    domainEntity.id = raw._id.toString();
    domainEntity.title = raw.title;
    domainEntity.description = raw.description;
    domainEntity.content = raw.content;
    domainEntity.draft = raw.draft;

    if (raw.tags) {
      const tags = raw.tags.map((tag) => TagMapper.toDomain(tag));
      domainEntity.tags = tags;
    }

    if (raw.banner) {
      domainEntity.banner = FileMapper.toDomain(raw.banner);
    }

    if (raw.author) {
      domainEntity.author = UserMapper.toDomain(raw.author);
    }

    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Post): PostSchemaClass {
    const persistenceSchema = new PostSchemaClass();

    if (domainEntity.id) {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.title = domainEntity.title;
    persistenceSchema.description = domainEntity.description;
    persistenceSchema.content = domainEntity.content;
    persistenceSchema.draft = domainEntity.draft;

    if (domainEntity.tags) {
      persistenceSchema.tags = domainEntity.tags.map((tag) => {
        const tagSchema = TagMapper.toPersistence(tag);
        return tagSchema;
      });
    }

    if (domainEntity.banner) {
      const bannerSchema = FileMapper.toPersistence(domainEntity.banner);
      persistenceSchema.banner = bannerSchema;
    } else if (domainEntity.banner === null) {
      persistenceSchema.banner = null;
    }

    if (domainEntity.author) {
      persistenceSchema.author = UserMapper.toPersistence(domainEntity.author);
    }

    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt;

    return persistenceSchema;
  }
}
