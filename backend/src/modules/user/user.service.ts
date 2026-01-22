import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

import { User } from './domain/user';
import { FileType } from '../file/domain/file';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';

import { RoleEnum, StatusEnum } from './user.enum';
import { AuthProvidersEnum } from '../auth/auth.enum';
import { FileStatusEnum } from '../file/file.enum';
import { FileService } from '../file/file.service';
import { NullableType } from '@/common/types/nullable.type';
import { Transaction } from 'nestjs-mongo-transactions';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly filesService: FileService,
  ) {}

  private async generateUsername(email: string): Promise<string> {
    let username = email.split('@')[0];

    const user = await this.usersRepository.findByUsername(username);

    if (user) {
      const firstFiveCharacter = nanoid().substring(0, 5);
      username += firstFiveCharacter;
    }

    return username;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    let password: string | undefined = undefined;
    let avatar: FileType | null | undefined = undefined;

    const { email } = createUserDto;
    const username = await this.generateUsername(email);

    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(createUserDto.password, salt);
    }

    if (email) {
      const userObject = await this.usersRepository.findByEmail(email);
      if (userObject) {
        throw new UnprocessableEntityException({
          errors: {
            email: 'Email already exists',
          },
        });
      }
    }

    if (createUserDto.avatar?.id) {
      const fileObject = await this.filesService.update(
        createUserDto.avatar.id,
        { status: FileStatusEnum.USED },
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          errors: {
            avatar: 'Image not exists',
          },
        });
      }
      avatar = fileObject;
    } else if (createUserDto.avatar === null) {
      avatar = null;
    }

    return this.usersRepository.create({
      fullName: createUserDto.fullName,
      email: email,
      username: username,
      password: password,
      avatar: avatar,
      role: createUserDto.role ?? RoleEnum.USER,
      status: createUserDto.status ?? StatusEnum.INACTIVE,
      provider: createUserDto.provider ?? AuthProvidersEnum.EMAIL,
    } as User);
  }

  @Transaction()
  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const user = await this.usersRepository.findById(id);

    if (updateUserDto.email) {
      await this.validateEmail(updateUserDto.email, id);
    }

    const newEmail = updateUserDto.newEmail ? updateUserDto.newEmail : '';
    if (newEmail) {
      await this.validateEmail(newEmail, id);
    }

    let password: string | undefined = undefined;
    if (
      updateUserDto.password &&
      user &&
      user.password !== updateUserDto.password
    ) {
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const avatar = await this.resolveAvatar(user?.avatar, updateUserDto.avatar);

    return this.usersRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      fullName: updateUserDto.fullName,
      email: updateUserDto.email,
      newEmail,
      password,
      bio: updateUserDto.bio,
      postCount: updateUserDto.postCount,
      commentCount: updateUserDto.commentCount,
      followerCount: updateUserDto.followerCount,
      followingCount: updateUserDto.followingCount,
      avatar,
      role: updateUserDto.role ?? undefined,
      status: updateUserDto.status ?? undefined,
      provider: updateUserDto.provider,
    });
  }

  async validateEmail(email: string, excludeId: User['id']): Promise<void> {
    const userObject = await this.usersRepository.findByEmail(email);
    if (userObject && userObject.id !== excludeId) {
      throw new UnprocessableEntityException({
        errors: { email: 'Email already exists' },
      });
    }
  }

  private async resolveAvatar(
    currentAvatar: FileType | null | undefined,
    newAvatarDto: { id: string } | null | undefined,
  ): Promise<FileType | null | undefined> {
    if (newAvatarDto?.id) {
      if (currentAvatar) {
        await this.filesService.update(currentAvatar.id, {
          status: FileStatusEnum.ORPHAN,
        });
      }
      const fileObject = await this.filesService.update(
        newAvatarDto.id,
        { status: FileStatusEnum.USED },
        { status: { $in: [FileStatusEnum.UPLOADED, FileStatusEnum.ORPHAN] } },
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          errors: { avatar: 'Image not exists' },
        });
      }
      return fileObject;
    } else if (newAvatarDto === null) {
      if (currentAvatar) {
        await this.filesService.update(currentAvatar.id, {
          status: FileStatusEnum.ORPHAN,
        });
      }
      return null;
    }
    return undefined;
  }

  comparePassword(password: string, user: User): Promise<boolean> {
    if (!user.password) {
      throw new UnprocessableEntityException('Password not set for user');
    }
    return bcrypt.compare(password, user.password);
  }

  findByEmail(email: User['email']): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: User['id']): Promise<NullableType<User>> {
    return this.usersRepository.findById(id);
  }
}
