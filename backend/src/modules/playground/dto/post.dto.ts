import { IsNumber, IsString, Length, Max, Min } from 'class-validator';

export class PostDto {
  @IsNumber()
  @Min(1)
  @Max(1000)
  id: number;

  @IsString()
  @Length(3, 50)
  name: string;
}
