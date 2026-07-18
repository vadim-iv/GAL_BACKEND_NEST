import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEmail, IsEnum, IsObject, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { MultiLangTextDto } from "src/blogs/dto/multiLangText.dto";
import { MemberRolesEnum } from "src/enums/member.enum";

export class MemberDto {

  // @IsOptional() only skips later validators for null/undefined, not '' — the
  // frontend sends an empty string for a deliberately-blank email, so @IsEmail()
  // needs to be skipped on falsy values explicitly via @ValidateIf instead.
  @ValidateIf((o) => !!o.email)
  @IsEmail()
  email?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangTextDto)
  name: MultiLangTextDto;

  // Long bio — only required when PRESIDENT is among the submitted roles.
  @IsOptional()
  @ValidateIf((o) => Array.isArray(o.roles) && o.roles.includes(MemberRolesEnum.PRESIDENT))
  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangTextDto)
  details?: MultiLangTextDto;

  // Short blurb — always required, used everywhere except the President's own paragraph.
  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangTextDto)
  shortDetails: MultiLangTextDto;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(MemberRolesEnum, { each: true })
  roles: MemberRolesEnum[];
}