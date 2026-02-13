import { MembersService } from './members.service';
import { MemberDto } from './dto/member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
export declare class MembersController {
    private readonly membersService;
    constructor(membersService: MembersService);
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/member.schema").Member, {}> & import("../schemas/member.schema").Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getById(id: string): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/member.schema").Member, {}> & import("../schemas/member.schema").Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    getByEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/member.schema").Member, {}> & import("../schemas/member.schema").Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    create(dto: MemberDto): Promise<import("../schemas/member.schema").Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, dto: UpdateMemberDto): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/member.schema").Member, {}> & import("../schemas/member.schema").Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/member.schema").Member, {}> & import("../schemas/member.schema").Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    resetPassword(email: string): Promise<{
        message: string;
    }>;
}
