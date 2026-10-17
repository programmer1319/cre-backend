import { IsNumberString, IsOptional } from 'class-validator';

/**
 * Trailing window for the analytics series, in months.
 *
 * The global ValidationPipe runs with `forbidNonWhitelisted`, so this DTO is what makes
 * `?months=12` a valid request rather than a 400.
 */
export class AnalyticsRangeDto {
  @IsOptional()
  @IsNumberString()
  months?: string;
}
