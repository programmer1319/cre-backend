import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional() @IsBoolean() emailNewLeads?: boolean;
  @IsOptional() @IsBoolean() pushNewLeads?: boolean;
  @IsOptional() @IsBoolean() weeklyDigest?: boolean;
  @IsOptional() @IsBoolean() compactMode?: boolean;
  @IsOptional() @IsBoolean() reducedMotion?: boolean;
}
