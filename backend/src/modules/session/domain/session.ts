import { User } from '@/modules/user/domain/user';

export class Session {
  id: string;
  user: User;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
