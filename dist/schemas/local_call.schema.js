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
exports.LocalCallSchema = exports.LocalCall = exports.LocalCallQuestion = exports.Project = exports.ProjectAnswer = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const text_schema_1 = require("./shared/text.schema");
const member_schema_1 = require("./member.schema");
const status_enum_1 = require("../enums/status.enum");
let ProjectAnswer = class ProjectAnswer {
    questionId;
    memberId;
    answer;
};
exports.ProjectAnswer = ProjectAnswer;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ProjectAnswer.prototype, "questionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: member_schema_1.Member.name, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ProjectAnswer.prototype, "memberId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0, max: 10 }),
    __metadata("design:type", Number)
], ProjectAnswer.prototype, "answer", void 0);
exports.ProjectAnswer = ProjectAnswer = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ProjectAnswer);
let Project = class Project {
    _id;
    title;
    description;
    pdfUrl;
    imageUrl;
    status;
    answers;
};
exports.Project = Project;
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], Project.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], Project.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Project.prototype, "pdfUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Project.prototype, "imageUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: status_enum_1.ApprovalStatusEnum, default: status_enum_1.ApprovalStatusEnum.PENDING, required: true }),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ProjectAnswer], required: false, default: [] }),
    __metadata("design:type", Array)
], Project.prototype, "answers", void 0);
exports.Project = Project = __decorate([
    (0, mongoose_1.Schema)()
], Project);
let LocalCallQuestion = class LocalCallQuestion {
    _id;
    question;
    maxScore;
};
exports.LocalCallQuestion = LocalCallQuestion;
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], LocalCallQuestion.prototype, "question", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 1, max: 10, default: 10 }),
    __metadata("design:type", Number)
], LocalCallQuestion.prototype, "maxScore", void 0);
exports.LocalCallQuestion = LocalCallQuestion = __decorate([
    (0, mongoose_1.Schema)()
], LocalCallQuestion);
let LocalCall = class LocalCall {
    name;
    description;
    imageUrl;
    questions;
    projects;
    voteStart;
    voteEnd;
};
exports.LocalCall = LocalCall;
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], LocalCall.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], LocalCall.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], LocalCall.prototype, "imageUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [LocalCallQuestion], required: true }),
    __metadata("design:type", Array)
], LocalCall.prototype, "questions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Project], required: false, default: [] }),
    __metadata("design:type", Array)
], LocalCall.prototype, "projects", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], LocalCall.prototype, "voteStart", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], LocalCall.prototype, "voteEnd", void 0);
exports.LocalCall = LocalCall = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LocalCall);
exports.LocalCallSchema = mongoose_1.SchemaFactory.createForClass(LocalCall);
//# sourceMappingURL=local_call.schema.js.map