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
exports.MembersJwtStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const members_service_1 = require("../members/members.service");
let MembersJwtStrategy = class MembersJwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'member-jwt') {
    configService;
    membersService;
    constructor(configService, membersService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: configService.get('JWT_SECRET') || "49)@',5BKi~W"
        });
        this.configService = configService;
        this.membersService = membersService;
    }
    async validate({ id }) {
        const memberDoc = await this.membersService.getById(id);
        if (!memberDoc)
            return null;
        return memberDoc.toObject();
    }
};
exports.MembersJwtStrategy = MembersJwtStrategy;
exports.MembersJwtStrategy = MembersJwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        members_service_1.MembersService])
], MembersJwtStrategy);
//# sourceMappingURL=members-jwt.strategy.js.map