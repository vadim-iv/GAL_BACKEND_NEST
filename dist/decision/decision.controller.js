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
exports.DecisionController = void 0;
const common_1 = require("@nestjs/common");
const decision_service_1 = require("./decision.service");
const get_decisions_dto_1 = require("./dto/get-decisions.dto");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const decision_dto_1 = require("./dto/decision.dto");
const member_auth_decorator_1 = require("../auth/decorators/member-auth.decorator");
const add_answers_dto_1 = require("./dto/add-answers.dto");
const update_decision_dto_1 = require("./dto/update-decision-dto");
const delete_images_dto_1 = require("../blogs/dto/delete-images.dto");
let DecisionController = class DecisionController {
    decisionService;
    constructor(decisionService) {
        this.decisionService = decisionService;
    }
    async getAll(getDecisionsDto) {
        return this.decisionService.getAll(getDecisionsDto);
    }
    async getById(id) {
        return this.decisionService.getById(id);
    }
    async create(dto) {
        return this.decisionService.create(dto);
    }
    async addAnswers(dto) {
        return this.decisionService.addAnswers(dto);
    }
    async update(id, dto) {
        return this.decisionService.update(id, dto);
    }
    async delete(id) {
        return this.decisionService.delete(id);
    }
    async generateImageUploadLink() {
        return this.decisionService.generateImageUploadLink();
    }
    async deleteFiles(dto) {
        return this.decisionService.deleteFiles(dto.imageUrls);
    }
    async generateResultsPdf(id, lang) {
        const buffer = await this.decisionService.generateResultsPdf(id, lang);
        return new common_1.StreamableFile(buffer);
    }
};
exports.DecisionController = DecisionController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_decisions_dto_1.GetDecisionsDto]),
    __metadata("design:returntype", Promise)
], DecisionController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DecisionController.prototype, "getById", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [decision_dto_1.DecisionDto]),
    __metadata("design:returntype", Promise)
], DecisionController.prototype, "create", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('add-answers'),
    (0, member_auth_decorator_1.MemberAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_answers_dto_1.AddDecisionAnswersDto]),
    __metadata("design:returntype", Promise)
], DecisionController.prototype, "addAnswers", null);
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
    __metadata("design:paramtypes", [String, update_decision_dto_1.UpdateDecisionDto]),
    __metadata("design:returntype", Promise)
], DecisionController.prototype, "update", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Delete)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DecisionController.prototype, "delete", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('generate-image-upload-link'),
    (0, auth_decorator_1.Auth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DecisionController.prototype, "generateImageUploadLink", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('delete-files'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_images_dto_1.DeleteImagesDto]),
    __metadata("design:returntype", Promise)
], DecisionController.prototype, "deleteFiles", null);
__decorate([
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="decision-results.pdf"'),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)(':id/results-pdf'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('lang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DecisionController.prototype, "generateResultsPdf", null);
exports.DecisionController = DecisionController = __decorate([
    (0, common_1.Controller)('decision'),
    __metadata("design:paramtypes", [decision_service_1.DecisionService])
], DecisionController);
//# sourceMappingURL=decision.controller.js.map