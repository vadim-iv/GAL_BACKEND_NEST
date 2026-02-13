"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberAuth = void 0;
const common_1 = require("@nestjs/common");
const members_jwt_guard_1 = require("../guards/members-jwt.guard");
const MemberAuth = () => (0, common_1.UseGuards)(members_jwt_guard_1.MembersJwtAuthGuard);
exports.MemberAuth = MemberAuth;
//# sourceMappingURL=member-auth.decorator.js.map