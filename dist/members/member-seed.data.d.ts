import { MemberRolesEnum } from 'src/enums/member.enum';
interface SeedMultiLangText {
    ro: string;
    ru: string;
    en: string;
}
export interface SeedMember {
    name: SeedMultiLangText;
    shortDetails: SeedMultiLangText;
    details?: SeedMultiLangText;
    roles: MemberRolesEnum[];
}
export declare const MEMBER_SEED_DATA: SeedMember[];
export {};
