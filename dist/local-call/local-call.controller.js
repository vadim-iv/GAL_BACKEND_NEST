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
exports.LocalCallController = void 0;
const common_1 = require("@nestjs/common");
const local_call_service_1 = require("./local-call.service");
const get_local_calls_dto_1 = require("./dto/get-local-calls.dto");
const get_projects_dto_1 = require("./dto/get-projects.dto");
const local_call_dto_1 = require("./dto/local-call.dto");
const update_local_call_dto_1 = require("./dto/update-local-call.dto");
const project_dto_1 = require("./dto/project.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const add_answers_dto_1 = require("./dto/add-answers.dto");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const member_auth_decorator_1 = require("../auth/decorators/member-auth.decorator");
const delete_images_dto_1 = require("../blogs/dto/delete-images.dto");
let LocalCallController = class LocalCallController {
    localCallService;
    constructor(localCallService) {
        this.localCallService = localCallService;
    }
    async getAll(dto) {
        return this.localCallService.getAll(dto);
    }
    async getById(id) {
        return this.localCallService.getById(id);
    }
    async getProjects(id, dto) {
        return this.localCallService.getProjects(id, dto);
    }
    async create(dto) {
        return this.localCallService.create(dto);
    }
    async update(id, dto) {
        return this.localCallService.update(id, dto);
    }
    async delete(id) {
        return this.localCallService.delete(id);
    }
    async addProject(id, dto) {
        return this.localCallService.addProject(id, dto);
    }
    async updateProject(id, projectId, dto) {
        return this.localCallService.updateProject(id, projectId, dto);
    }
    async deleteProject(id, projectId) {
        return this.localCallService.deleteProject(id, projectId);
    }
    async addAnswers(dto) {
        return this.localCallService.addAnswers(dto);
    }
    async generateFileUploadLink() {
        return this.localCallService.generateFileUploadLink();
    }
    async generateImageUploadLink() {
        return this.localCallService.generateImageUploadLink();
    }
    async deleteFiles(dto) {
        return this.localCallService.deleteDocuments(dto.imageUrls);
    }
    async generateProjectResultsPdf(id, projectId, lang) {
        const buffer = await this.localCallService.generateProjectResultsPdf(id, projectId, lang);
        return new common_1.StreamableFile(buffer);
    }
};
exports.LocalCallController = LocalCallController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_local_calls_dto_1.GetLocalCallsDto]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(':id/projects'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_projects_dto_1.GetProjectsDto]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "getProjects", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [local_call_dto_1.LocalCallDto]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "create", null);
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
    __metadata("design:paramtypes", [String, update_local_call_dto_1.UpdateLocalCallDto]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "update", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Delete)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "delete", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)(':id/project'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_dto_1.ProjectDto]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "addProject", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
        skipMissingProperties: false
    })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Put)(':id/project/:projectId'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "updateProject", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Delete)(':id/project/:projectId'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "deleteProject", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('add-answers'),
    (0, member_auth_decorator_1.MemberAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_answers_dto_1.AddLocalCallAnswersDto]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "addAnswers", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('generate-upload-link'),
    (0, auth_decorator_1.Auth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "generateFileUploadLink", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('generate-image-upload-link'),
    (0, auth_decorator_1.Auth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "generateImageUploadLink", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('delete-files'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_images_dto_1.DeleteImagesDto]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "deleteFiles", null);
__decorate([
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="project-results.pdf"'),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)(':id/project/:projectId/results-pdf'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Query)('lang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LocalCallController.prototype, "generateProjectResultsPdf", null);
exports.LocalCallController = LocalCallController = __decorate([
    (0, common_1.Controller)('local-call'),
    __metadata("design:paramtypes", [local_call_service_1.LocalCallService])
], LocalCallController);
//# sourceMappingURL=local-call.controller.js.map