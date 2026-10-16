import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

const asNumber = ({ value }: { value: unknown }) => Number(value);

export class PropertyWriteDto {
  @IsString() @MinLength(2) @MaxLength(180) title!: string;
  @IsString() @MinLength(10) description!: string;
  @IsString() @MaxLength(120) city!: string;
  @IsString() @MaxLength(255) location!: string;
  @IsString() @MaxLength(80) propertyType!: string;
  @Transform(asNumber) @IsNumber() @Min(0) price!: number;
  @Transform(asNumber) @IsNumber() @Min(0) area!: number;
  @Transform(asNumber) @IsNumber() @Min(0) bedrooms!: number;
  @Transform(asNumber) @IsNumber() @Min(0) bathrooms!: number;
  @Transform(asNumber) @IsNumber() latitude!: number;
  @Transform(asNumber) @IsNumber() longitude!: number;
  @IsOptional() @IsString({ each: true }) keepImages?: string | string[];
}
