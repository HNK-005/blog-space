import { Tag } from '../domain/tag.domain';
import { TagSchemaClass } from '../entities/tag.schema';

export class TagMapper {
  static toDomain(raw: TagSchemaClass): Tag {
    const domainEntity = new Tag();
    domainEntity.id = raw._id.toString();
    domainEntity.name = raw.name;
    domainEntity.slug = raw.slug;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Tag): TagSchemaClass {
    const persistenceSchema = new TagSchemaClass();

    if (domainEntity.id) {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.name = domainEntity.name;
    persistenceSchema.slug = domainEntity.slug;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt;

    return persistenceSchema;
  }
}
