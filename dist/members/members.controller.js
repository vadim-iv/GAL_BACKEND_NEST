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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersController = void 0;
const common_1 = require("@nestjs/common");
const members_service_1 = require("./members.service");
const member_seed_service_1 = require("./member-seed.service");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const member_dto_1 = require("./dto/member.dto");
const update_member_dto_1 = require("./dto/update-member.dto");
const member_auth_decorator_1 = require("../auth/decorators/member-auth.decorator");
const delete_images_dto_1 = require("../blogs/dto/delete-images.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const confirm_password_reset_dto_1 = require("./dto/confirm-password-reset.dto");
let MembersController = class MembersController {
    membersService;
    memberSeedService;
    constructor(membersService, memberSeedService) {
        this.membersService = membersService;
        this.memberSeedService = memberSeedService;
    }
    findAll() {
        return this.membersService.findAll();
    }
    async getById(id) {
        return this.membersService.getById(id);
    }
    async getByEmail(email) {
        return this.membersService.getByEmail(email);
    }
    async create(dto) {
        return this.membersService.create(dto);
    }
    async update(id, dto) {
        return this.membersService.update(id, dto);
    }
    async delete(id) {
        return this.membersService.delete(id);
    }
    async generateImageUploadLink() {
        return this.membersService.generateImageUploadLink();
    }
    async runSeed() {
        return this.memberSeedService.seed();
    }
    async deleteFiles(dto) {
        return this.membersService.deleteMemberImages(dto.imageUrls);
    }
    async resetPassword(email) {
        return this.membersService.resetPassword(email);
    }
    async forgotPassword(dto) {
        return this.membersService.forgotPassword(dto.email);
    }
    async confirmPasswordReset(dto) {
        return this.membersService.confirmPasswordReset(dto.token);
    }
};
exports.MembersController = MembersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MembersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)('email/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "getByEmail", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [member_dto_1.MemberDto]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "create", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
        skipMissingProperties: false
    })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Put)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_member_dto_1.UpdateMemberDto]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "update", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Delete)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "delete", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('generate-upload-link'),
    (0, auth_decorator_1.Auth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "generateImageUploadLink", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('run-seed'),
    (0, auth_decorator_1.Auth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "runSeed", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('delete-files'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_images_dto_1.DeleteImagesDto]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "deleteFiles", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('reset-password'),
    (0, member_auth_decorator_1.MemberAuth)(),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('confirm-password-reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_password_reset_dto_1.ConfirmPasswordResetDto]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "confirmPasswordReset", null);
exports.MembersController = MembersController = __decorate([
    (0, common_1.Controller)('members'),
    __metadata("design:paramtypes", [members_service_1.MembersService,
        member_seed_service_1.MemberSeedService])
], MembersController);
//# sourceMappingURL=members.controller.js.map