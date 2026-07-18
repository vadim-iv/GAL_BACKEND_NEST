import { HydratedDocument } from 'mongoose';
import { MultiLangText } from './shared/text.schema';
import { MemberRolesEnum } from 'src/enums/member.enum';
export type TMember = HydratedDocument<Member>;
export declare class Member {
    email?: string;
    password?: string;
    name: MultiLangText;
    details?: MultiLangText;
    shortDetails: MultiLangText;
    imageUrl?: string;
    roles: MemberRolesEnum[];
    resetPasswordTokenHash?: string;
    resetPasswordTokenExpires?: Date;
}
export declare const MemberSchema: import("mongoose").Schema<Member, import("mongoose").Model<Member, any, any, any, import("mongoose").Document<unknown, any, Member, any> & Member & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Member, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Member>, {}> & import("mongoose").FlatRecord<Member> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
