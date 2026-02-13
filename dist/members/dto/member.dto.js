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
exports.MemberDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const multiLangText_dto_1 = require("../../blogs/dto/multiLangText.dto");
const member_enum_1 = require("../../enums/member.enum");
class MemberDto {
    email;
    name;
    details;
    imageUrl;
    role;
}
exports.MemberDto = MemberDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], MemberDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => multiLangText_dto_1.MultiLangTextDto),
    __metadata("design:type", multiLangText_dto_1.MultiLangTextDto)
], MemberDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => multiLangText_dto_1.MultiLangTextDto),
    __metadata("design:type", multiLangText_dto_1.MultiLangTextDto)
], MemberDto.prototype, "details", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MemberDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(member_enum_1.MemberRolesEnum),
    __metadata("design:type", String)
], MemberDto.prototype, "role", void 0);
//# sourceMappingURL=member.dto.js.map