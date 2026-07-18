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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MemberSeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberSeedService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const member_schema_1 = require("../schemas/member.schema");
const management_service_1 = require("../management/management.service");
const member_seed_data_1 = require("./member-seed.data");
let MemberSeedService = MemberSeedService_1 = class MemberSeedService {
    memberModel;
    managementService;
    logger = new common_1.Logger(MemberSeedService_1.name);
    constructor(memberModel, managementService) {
        this.memberModel = memberModel;
        this.managementService = managementService;
    }
    async seed() {
        await this.ensureEmailIndexIsSparse();
        const existingCount = await this.memberModel.countDocuments();
        this.logger.warn(`[member-seed] Wiping ${existingCount} existing member(s) and inserting ${member_seed_data_1.MEMBER_SEED_DATA.length} seed member(s)...`);
        await this.memberModel.deleteMany({});
        for (const seedMember of member_seed_data_1.MEMBER_SEED_DATA) {
            await this.memberModel.create(seedMember);
        }
        await this.managementService.syncFromMembers();
        this.logger.warn('[member-seed] Done.');
        return {
            wiped: existingCount,
            inserted: member_seed_data_1.MEMBER_SEED_DATA.length
        };
    }
    async ensureEmailIndexIsSparse() {
        const indexes = await this.memberModel.collection.indexes();
        const emailIndex = indexes.find((index) => index.name === 'email_1');
        if (emailIndex && !emailIndex.sparse) {
            this.logger.warn('[member-seed] Rebuilding non-sparse email_1 index as sparse...');
            await this.memberModel.collection.dropIndex('email_1');
            await this.memberModel.syncIndexes();
        }
    }
};
exports.MemberSeedService = MemberSeedService;
exports.MemberSeedService = MemberSeedService = MemberSeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(member_schema_1.Member.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        management_service_1.ManagementService])
], MemberSeedService);
//# sourceMappingURL=member-seed.service.js.map