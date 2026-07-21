import { Model } from 'mongoose';
import { Member } from 'src/schemas/member.schema';
import { MemberDto } from './dto/member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ManagementService } from 'src/management/management.service';
import { AwsService } from 'src/aws/aws.service';
export declare class MembersService {
    private memberModel;
    private readonly managementService;
    private readonly awsService;
    private readonly logger;
    constructor(memberModel: Model<Member>, managementService: ManagementService, awsService: AwsService);
    private syncManagement;
    private transporter;
    private generateRandomPassword;
    private getLoginUrl;
    private loginCtaHtml;
    private createHtmlMessageCreation;
    private createHtmlMessageReset;
    private createHtmlMessageResetLink;
    private createHtmlMessageEmailChanged;
    private createHtmlMessageAccountRemoved;
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
    private assertEmailAvailable;
    private provisionAccountForEmail;
    private notifyAccountRemoved;
    private reprovisionAccountForEmailChange;
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
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    confirmPasswordReset(token: string): Promise<{
        message: string;
    }>;
    generateImageUploadLink(): Promise<{
        success: boolean;
        uploadUrl: string;
        publicUrl: string;
        key: string;
    }>;
    deleteMemberImages(imageUrls: string[]): Promise<{
        success: boolean;
    }>;
}
