import { MemberAuthDto } from '../dto/member-auth.dto';
import { MembersAuthService } from './members-auth.service';
import { Request, Response } from 'express';
export declare class MembersAuthController {
    private readonly authService;
    constructor(authService: MembersAuthService);
    login(dto: MemberAuthDto, res: Response): Promise<{
        accessToken: string;
        member: {
            email?: string;
            name: import("../../schemas/shared/text.schema").MultiLangText;
            details?: import("../../schemas/shared/text.schema").MultiLangText;
            shortDetails: import("../../schemas/shared/text.schema").MultiLangText;
            imageUrl?: string;
            roles: import("../../enums/member.enum").MemberRolesEnum[];
            resetPasswordTokenHash?: string;
            resetPasswordTokenExpires?: Date;
            _id: import("mongoose").Types.ObjectId;
            __v: number;
        };
    }>;
    getNewTokens(req: Request, res: Response): Promise<{
        accessToken: string;
        member: {
            email?: string;
            name: import("../../schemas/shared/text.schema").MultiLangText;
            details?: import("../../schemas/shared/text.schema").MultiLangText;
            shortDetails: import("../../schemas/shared/text.schema").MultiLangText;
            imageUrl?: string;
            roles: import("../../enums/member.enum").MemberRolesEnum[];
            resetPasswordTokenHash?: string;
            resetPasswordTokenExpires?: Date;
            _id: import("mongoose").Types.ObjectId;
            __v: number;
        };
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
}
