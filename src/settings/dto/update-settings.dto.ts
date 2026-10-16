import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import type { AppearanceTheme } from '../settings.entity';

export class UpdateSettingsDto {
  @IsOptional() @IsBoolean() emailNewLeads?: boolean;
  @IsOptional() @IsBoolean() pushNewLeads?: boolean;
  @IsOptional() @IsBoolean() weeklyDigest?: boolean;
  @IsOptional() @IsIn(['light', 'dark', 'system']) theme?: AppearanceTheme;
  @IsOptional() @IsBoolean() compactMode?: boolean;
  @IsOptional() @IsBoolean() reducedMotion?: boolean;
}
