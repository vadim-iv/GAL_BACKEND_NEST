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
exports.DecisionDto = exports.DecisionQuestionDto = exports.DecisionAnswerDto = exports.DecisionOptionDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const multiLangText_dto_1 = require("../../blogs/dto/multiLangText.dto");
const decision_enum_1 = require("../../enums/decision.enum");
class DecisionOptionDto {
    value;
    label;
}
exports.DecisionOptionDto = DecisionOptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DecisionOptionDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => multiLangText_dto_1.MultiLangTextDto),
    __metadata("design:type", multiLangText_dto_1.MultiLangTextDto)
], DecisionOptionDto.prototype, "label", void 0);
class DecisionAnswerDto {
    memberId;
    value;
}
exports.DecisionAnswerDto = DecisionAnswerDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], DecisionAnswerDto.prototype, "memberId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DecisionAnswerDto.prototype, "value", void 0);
class DecisionQuestionDto {
    question;
    type;
    options;
    answers;
}
exports.DecisionQuestionDto = DecisionQuestionDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => multiLangText_dto_1.MultiLangTextDto),
    __metadata("design:type", multiLangText_dto_1.MultiLangTextDto)
], DecisionQuestionDto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(decision_enum_1.DecisionQuestionType),
    __metadata("design:type", String)
], DecisionQuestionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DecisionOptionDto),
    __metadata("design:type", Array)
], DecisionQuestionDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DecisionAnswerDto),
    __metadata("design:type", Array)
], DecisionQuestionDto.prototype, "answers", void 0);
class DecisionDto {
    title;
    description;
    questions;
    voteStart;
    voteEnd;
}
exports.DecisionDto = DecisionDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => multiLangText_dto_1.MultiLangTextDto),
    __metadata("design:type", multiLangText_dto_1.MultiLangTextDto)
], DecisionDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => multiLangText_dto_1.MultiLangTextDto),
    __metadata("design:type", multiLangText_dto_1.MultiLangTextDto)
], DecisionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DecisionQuestionDto),
    __metadata("design:type", Array)
], DecisionDto.prototype, "questions", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DecisionDto.prototype, "voteStart", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DecisionDto.prototype, "voteEnd", void 0);
//# sourceMappingURL=decision.dto.js.map