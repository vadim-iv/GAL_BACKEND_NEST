import { OmitType, PartialType } from "@nestjs/mapped-types";
import { MemberDto } from "./member.dto";

export class UpdateMemberDto extends OmitType(PartialType(MemberDto), ['email']) {}