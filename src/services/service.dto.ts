import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsInt, IsNotEmpty,
  IsString, Matches, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

class ServiceStepDto {
  @IsString() @IsNotEmpty() @MaxLength(120) title!: string;
  @IsString() @IsNotEmpty() @MaxLength(1000) detail!: string;
}

class ServiceFaqDto {
  @IsString() @IsNotEmpty() @MaxLength(250) question!: string;
  @IsString() @IsNotEmpty() @MaxLength(1500) answer!: string;
}

export class CreateServiceDto {
  @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(100) slug!: string;
  @IsString() @IsNotEmpty() @MaxLength(160) title!: string;
  @IsString() @Matches(/^pi-[a-z0-9-]+$/) @MaxLength(80) icon!: string;
  @IsString() @IsNotEmpty() @MaxLength(300) summary!: string;
  @IsString() @IsNotEmpty() @MaxLength(120) kicker!: string;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(8) @IsString({ each: true }) body!: string[];
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(16) @IsString({ each: true }) outcomes!: string[];
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(12) @ValidateNested({ each: true }) @Type(() => ServiceStepDto) process!: ServiceStepDto[];
  @IsArray() @ArrayMaxSize(16) @ValidateNested({ each: true }) @Type(() => ServiceFaqDto) faqs!: ServiceFaqDto[];
  @IsString() @IsNotEmpty() @MaxLength(500) image!: string;
  @IsBoolean() isActive!: boolean;
  @IsBoolean() featured!: boolean;
  @IsInt() @Min(0) @Max(10000) sortOrder!: number;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
