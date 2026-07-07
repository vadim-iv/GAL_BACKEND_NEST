import { Model } from 'mongoose';
import { Member } from 'src/schemas/member.schema';
import { MemberDto } from './dto/member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ManagementService } from 'src/management/management.service';
export declare class MembersService {
    private memberModel;
    private readonly managementService;
    private readonly logger;
    constructor(memberModel: Model<Member>, managementService: ManagementService);
    private syncManagement;
    private transporter;
    private generateRandomPassword;
    private createHtmlMessageCreation;
    private createHtmlMessageReset;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, Member, {}> & Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getById(id: string): Promise<(import("mongoose").Document<unknown, {}, Member, {}> & Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    getByEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, Member, {}> & Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    create(dto: MemberDto): Promise<Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, dto: UpdateMemberDto): Promise<(import("mongoose").Document<unknown, {}, Member, {}> & Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, Member, {}> & Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    resetPassword(email: string): Promise<{
        message: string;
    }>;
}
