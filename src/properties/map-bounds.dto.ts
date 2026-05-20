import { IsNumber } from 'class-validator';

export class MapBoundsDto {
  @IsNumber()
  north!: number;

  @IsNumber()
  south!: number;

  @IsNumber()
  east!: number;

  @IsNumber()
  west!: number;
}
