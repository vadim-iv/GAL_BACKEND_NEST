import { MembersService } from './members.service';
import { MemberDto } from './dto/member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { DeleteImagesDto } from 'src/blogs/dto/delete-images.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
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
    generateImageUploadLink(): Promise<{
        success: boolean;
        uploadUrl: string;
        publicUrl: string;
        key: string;
    }>;
    deleteFiles(dto: DeleteImagesDto): Promise<{
        success: boolean;
    }>;
    resetPassword(email: string): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    confirmPasswordReset(dto: ConfirmPasswordResetDto): Promise<{
        message: string;
    }>;
}
