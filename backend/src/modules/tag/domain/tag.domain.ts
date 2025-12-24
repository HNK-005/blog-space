import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class Tag {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: String,
  })
  slug: string;

  @ApiProperty({
    type: Date,
  })
  @Exclude({ toPlainOnly: true })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  @Exclude({ toPlainOnly: true })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    required: false,
  })
  @Exclude({ toPlainOnly: true })
  deletedAt?: Date;
}
