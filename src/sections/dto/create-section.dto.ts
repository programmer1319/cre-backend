// dto/create-section.dto.ts
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const SECTION_TYPES = [
  'hero',
  'grid',
  'carousel',
  'cta',
  'form',
  'text',
  'gallery',
  'team',
];

export class CreateSectionDto {
  @IsInt()
  pageId!: number;

  @IsString()
  @MaxLength(100)
  sectionKey!: string;

  @IsString()
  @IsIn(SECTION_TYPES)
  sectionType!: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, any>;

  @IsOptional()
  @IsInt()
  heroImageId?: number;

  @IsOptional()
  @IsInt()
  thumbnailId?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  galleryIds?: number[];

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
