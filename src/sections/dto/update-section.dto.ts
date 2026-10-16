// dto/update-section.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSectionDto } from './create-section.dto';
export class UpdateSectionDto extends PartialType(CreateSectionDto) {
  content?: Record<string, any>;
  heroImageId?: number;
  thumbnailId?: number;
  mediaIds?: number[];
}
