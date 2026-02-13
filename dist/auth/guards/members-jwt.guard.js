"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersJwtAuthGuard = void 0;
const passport_1 = require("@nestjs/passport");
class MembersJwtAuthGuard extends (0, passport_1.AuthGuard)('member-jwt') {
}
exports.MembersJwtAuthGuard = MembersJwtAuthGuard;
//# sourceMappingURL=members-jwt.guard.js.map