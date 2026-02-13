import { MultiLangTextDto } from "src/blogs/dto/multiLangText.dto";
import { MemberRolesEnum } from "src/enums/member.enum";
export declare class MemberDto {
    email: string;
    name: MultiLangTextDto;
    details: MultiLangTextDto;
    imageUrl?: string;
    role: MemberRolesEnum;
}
