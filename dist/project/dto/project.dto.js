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
exports.ProjectDto = exports.ProjectQuestionDto = exports.ProjectAnswerDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const multiLangText_dto_1 = require("../../blogs/dto/multiLangText.dto");
class ProjectAnswerDto {
    memberId;
    answer;
}
exports.ProjectAnswerDto = ProjectAnswerDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], ProjectAnswerDto.prototype, "memberId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], ProjectAnswerDto.prototype, "answer", void 0);
class ProjectQuestionDto {
    question;
    answers;
}
exports.ProjectQuestionDto = ProjectQuestionDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => multiLangText_dto_1.MultiLangTextDto),
    __metadata("design:type", multiLangText_dto_1.MultiLangTextDto)
], ProjectQuestionDto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProjectAnswerDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ProjectQuestionDto.prototype, "answers", void 0);
class ProjectDto {
    title;
    description;
    questions;
    pdfUrl;
    voteStart;
    voteEnd;
}
exports.ProjectDto = ProjectDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => multiLangText_dto_1.MultiLangTextDto),
    __metadata("design:type", multiLangText_dto_1.MultiLangTextDto)
], ProjectDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => multiLangText_dto_1.MultiLangTextDto),
    __metadata("design:type", multiLangText_dto_1.MultiLangTextDto)
], ProjectDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProjectQuestionDto),
    __metadata("design:type", Array)
], ProjectDto.prototype, "questions", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProjectDto.prototype, "pdfUrl", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ProjectDto.prototype, "voteStart", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ProjectDto.prototype, "voteEnd", void 0);
//# sourceMappingURL=project.dto.js.map