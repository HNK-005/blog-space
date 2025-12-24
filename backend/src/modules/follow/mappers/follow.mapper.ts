import { UserMapper } from '@/modules/user/mappers/user.mapper';
import { Follow } from '../domain/follow';
import { FollowSchemaClass } from '../entities/follow.schema';

export class FollowMapper {
  toDomain(raw: FollowSchemaClass): Follow {
    const domain = new Follow();
    domain.id = raw._id;
    domain.followerId = UserMapper.toDomain(raw.follower);
    domain.followingId = UserMapper.toDomain(raw.following);
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    domain.deletedAt = raw.deletedAt;
    return domain;
  }
  toPersitence(domain: Follow): FollowSchemaClass {
    const raw = new FollowSchemaClass();
    raw._id = domain.id;
    raw.follower = UserMapper.toPersistence(domain.followerId);
    raw.following = UserMapper.toPersistence(domain.followingId);
    raw.createdAt = domain.createdAt;
    raw.updatedAt = domain.updatedAt;
    raw.deletedAt = domain.deletedAt;
    return raw;
  }
}
