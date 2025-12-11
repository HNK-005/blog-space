import { ApiProperty } from '@nestjs/swagger';

export class GetDto {
  @ApiProperty({
    type: Number,
    description: 'The unique identifier of the object',
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: 'The name of the object',
    example: 'Test Object',
  })
  name: string;
}
