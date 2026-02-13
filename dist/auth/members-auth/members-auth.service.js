"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const members_service_1 = require("../../members/members.service");
const argon2_1 = require("argon2");
let MembersAuthService = class MembersAuthService {
    jwt;
    membersService;
    REFRESH_TOKEN_NAME = 'memberRefreshToken';
    EXPIRE_DAY_REFRESH_TOKEN = 7;
    constructor(jwt, membersService) {
        this.jwt = jwt;
        this.membersService = membersService;
    }
    async login(dto) {
        const { password, ...member } = (await this.validateMember(dto)).toObject();
        const tokens = this.issueTokens(member._id.toString());
        return {
            member,
            ...tokens
        };
    }
    async getNewTokens(refreshToken) {
        const result = await this.jwt.verifyAsync(refreshToken);
        if (!result)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const memberDoc = await this.membersService.getById(result.id);
        if (!memberDoc)
            throw new common_1.BadRequestException('Member not found');
        const { password, ...member } = memberDoc.toObject();
        const tokens = this.issueTokens(member._id.toString());
        return { member, ...tokens };
    }
    issueTokens(memberId) {
        const data = { id: memberId };
        const accessToken = this.jwt.sign(data, {
            expiresIn: '1h'
        });
        const refreshToken = this.jwt.sign(data, {
            expiresIn: '7d'
        });
        return { accessToken, refreshToken };
    }
    async validateMember(dto) {
        const member = await this.membersService.getByEmail(dto.email);
        if (!member)
            throw new common_1.NotFoundException('User not found');
        const isValid = await (0, argon2_1.verify)(member.password, dto.password);
        if (!isValid)
            throw new common_1.UnauthorizedException('Invalid password');
        return member;
    }
    addRefreshTokenToResponse(res, refreshToken) {
        const expiresIn = new Date();
        expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);
        res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
            httpOnly: true,
            expires: expiresIn,
            secure: true,
            sameSite: 'none'
        });
    }
    removeRefreshTokenFromResponse(res) {
        res.cookie(this.REFRESH_TOKEN_NAME, '', {
            httpOnly: true,
            expires: new Date(0),
            secure: true,
            sameSite: 'none'
        });
    }
};
exports.MembersAuthService = MembersAuthService;
exports.MembersAuthService = MembersAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        members_service_1.MembersService])
], MembersAuthService);
//# sourceMappingURL=members-auth.service.js.map