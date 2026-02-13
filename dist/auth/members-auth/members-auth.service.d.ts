import { JwtService } from '@nestjs/jwt';
import { MembersService } from 'src/members/members.service';
import { MemberAuthDto } from '../dto/member-auth.dto';
import { Response } from 'express';
export declare class MembersAuthService {
    private jwt;
    private membersService;
    REFRESH_TOKEN_NAME: string;
    EXPIRE_DAY_REFRESH_TOKEN: number;
    constructor(jwt: JwtService, membersService: MembersService);
    login(dto: MemberAuthDto): Promise<{
        accessToken: string;
        refreshToken: string;
        member: {
            email: string;
            name: import("../../schemas/shared/text.schema").MultiLangText;
            details: import("../../schemas/shared/text.schema").MultiLangText;
            imageUrl?: string;
            role: import("../../enums/member.enum").MemberRolesEnum;
            _id: import("mongoose").Types.ObjectId;
            __v: number;
        };
    }>;
    getNewTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        member: {
            email: string;
            name: import("../../schemas/shared/text.schema").MultiLangText;
            details: import("../../schemas/shared/text.schema").MultiLangText;
            imageUrl?: string;
            role: import("../../enums/member.enum").MemberRolesEnum;
            _id: import("mongoose").Types.ObjectId;
            __v: number;
        };
    }>;
    private issueTokens;
    private validateMember;
    addRefreshTokenToResponse(res: Response, refreshToken: string): void;
    removeRefreshTokenFromResponse(res: Response): void;
}
