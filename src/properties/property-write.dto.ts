import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Property } from './property.entity';

const asNumber = ({ value }: { value: unknown }) => Number(value);
const asBoolean = ({ value }: { value: unknown }) => value === true || value === 'true';
const asJsonArray = ({ value }: { value: unknown }) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value) as unknown; } catch { return value; }
};

class PropertyDocumentDto {
  @IsString() @MinLength(2) @MaxLength(120) title!: string;
  @IsUrl({ require_protocol: true, protocols: ['https'] }) url!: string;
}

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
  @IsOptional() @IsEnum(['sale', 'lease', 'sale-lease']) transactionType?: Property['transactionType'];
  @IsOptional() @IsEnum(['available', 'under-offer', 'leased', 'sold', 'withdrawn']) status?: Property['status'];
  @IsOptional() @IsEnum(['published', 'draft']) visibility?: Property['visibility'];
  @IsOptional() @IsString() @MaxLength(80) priceUnit?: string;
  @IsOptional() @Transform(asBoolean) @IsBoolean() featured?: boolean;
  @IsOptional() @Transform(asJsonArray) @IsArray() @IsString({ each: true }) amenities?: string[];
  @IsOptional() @Transform(asJsonArray) @IsArray() @ValidateNested({ each: true }) @Type(() => PropertyDocumentDto) documents?: PropertyDocumentDto[];
  @IsOptional() @IsString({ each: true }) keepImages?: string | string[];
}
