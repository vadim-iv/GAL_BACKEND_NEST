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
exports.ManagementController = void 0;
const common_1 = require("@nestjs/common");
const management_service_1 = require("./management.service");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const update_main_image_dto_1 = require("./dto/update-main-image.dto");
let ManagementController = class ManagementController {
    managementService;
    constructor(managementService) {
        this.managementService = managementService;
    }
    async getManagement() {
        return this.managementService.getManagement();
    }
    async updateMainImage(dto) {
        return this.managementService.updateMainImage(dto.main_image);
    }
    async sync() {
        await this.managementService.syncFromMembers();
        return this.managementService.getManagement();
    }
};
exports.ManagementController = ManagementController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManagementController.prototype, "getManagement", null);
__decorate([
    (0, common_1.Patch)('main-image'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true })),
    (0, common_1.HttpCode)(200),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_main_image_dto_1.UpdateMainImageDto]),
    __metadata("design:returntype", Promise)
], ManagementController.prototype, "updateMainImage", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, common_1.HttpCode)(200),
    (0, auth_decorator_1.Auth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManagementController.prototype, "sync", null);
exports.ManagementController = ManagementController = __decorate([
    (0, swagger_1.ApiTags)('🛠️ Management'),
    (0, common_1.Controller)('management'),
    __metadata("design:paramtypes", [management_service_1.ManagementService])
], ManagementController);
//# sourceMappingURL=management.controller.js.map