import { IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';

/**
 * Viewport for the map view.
 *
 * The filter fields mirror `FilterPropertyDto` so the map and the list beside it can answer the
 * same question: without them, narrowing the list to "Warehouse under $2M" would leave every
 * unrelated pin on the map. The global ValidationPipe runs with `forbidNonWhitelisted`, so any
 * filter the client sends has to be declared here or the request is rejected.
 */
export class MapBoundsDto {
  @IsNumber()
  north!: number;

  @IsNumber()
  south!: number;

  @IsNumber()
  east!: number;

  @IsNumber()
  west!: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsNumberString()
  bedrooms?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}
