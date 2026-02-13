import { Type } from "class-transformer";
import { IsEmail, IsEnum, IsObject, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { MultiLangTextDto } from "src/blogs/dto/multiLangText.dto";
import { MemberRolesEnum } from "src/enums/member.enum";

export class MemberDto {

  @IsEmail()
  email: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangTextDto)
  name: MultiLangTextDto;

  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangTextDto)
  details: MultiLangTextDto;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsEnum(MemberRolesEnum)
  role: MemberRolesEnum;
}