import { User } from '../domain/user';
import { UserSchemaClass } from '../entities/user.chema';
import { FileMapper } from '@/modules/file/mappers/file.mapper';
import { FileSchemaClass } from '@/modules/file/entities/file.schema';

export class UserMapper {
  static toDomain(raw: UserSchemaClass): User {
    const domainEntity = new User();

    if (raw.avatar) {
      domainEntity.avatar = FileMapper.toDomain(raw.avatar);
    } else if (raw.avatar === null) {
      domainEntity.avatar = null;
    }

    domainEntity.id = raw._id.toString();
    domainEntity.email = raw.email;
    domainEntity.newEmail = raw.newEmail;
    domainEntity.username = raw.username;
    domainEntity.password = raw.password;
    domainEntity.provider = raw.provider;
    domainEntity.fullName = raw.fullName;
    domainEntity.bio = raw.bio;
    domainEntity.postCount = raw.postCount;
    domainEntity.commentCount = raw.commentCount;
    domainEntity.followerCount = raw.followerCount;
    domainEntity.followingCount = raw.followingCount;
    domainEntity.role = raw.role;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: User): UserSchemaClass {
    const persistenceSchema = new UserSchemaClass();

    let avatar: FileSchemaClass | null | undefined;

    if (domainEntity.id) {
      persistenceSchema._id = domainEntity.id;
    }

    if (domainEntity.avatar) {
      avatar = FileMapper.toPersistence(domainEntity.avatar);
    } else if (domainEntity.avatar === null) {
      avatar = null;
    }

    if (domainEntity.role) {
      persistenceSchema.role = domainEntity.role;
    }

    if (domainEntity.status) {
      persistenceSchema.status = domainEntity.status;
    }

    persistenceSchema.email = domainEntity.email;
    persistenceSchema.newEmail = domainEntity.newEmail;
    persistenceSchema.password = domainEntity.password;
    persistenceSchema.provider = domainEntity.provider;
    persistenceSchema.bio = domainEntity.bio;
    persistenceSchema.fullName = domainEntity.fullName;
    persistenceSchema.avatar = avatar;
    persistenceSchema.username = domainEntity.username;
    persistenceSchema.postCount = domainEntity.postCount;
    persistenceSchema.commentCount = domainEntity.commentCount;
    persistenceSchema.followerCount = domainEntity.followerCount;
    persistenceSchema.followingCount = domainEntity.followingCount;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt;
    return persistenceSchema;
  }
}
