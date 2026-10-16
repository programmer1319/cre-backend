import { IsEmail, IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateLeadDto {
  @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(5) @MaxLength(4000) message!: string;
  @IsInt() property!: number;
}
