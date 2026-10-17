import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @IsEmail() @MaxLength(190) email!: string;
  @IsOptional() @IsString() @MaxLength(160) company?: string;
  @IsString() @MinLength(10) @MaxLength(5000) message!: string;
}
