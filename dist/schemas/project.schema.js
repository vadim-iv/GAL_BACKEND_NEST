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
exports.ProjectSchema = exports.Project = exports.ProjectQuestion = exports.ProjectAnswer = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const text_schema_1 = require("./shared/text.schema");
const member_schema_1 = require("./member.schema");
let ProjectAnswer = class ProjectAnswer {
    memberId;
    answer;
};
exports.ProjectAnswer = ProjectAnswer;
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
let ProjectQuestion = class ProjectQuestion {
    _id;
    question;
    answers;
};
exports.ProjectQuestion = ProjectQuestion;
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], ProjectQuestion.prototype, "question", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ProjectAnswer], required: false }),
    __metadata("design:type", Array)
], ProjectQuestion.prototype, "answers", void 0);
exports.ProjectQuestion = ProjectQuestion = __decorate([
    (0, mongoose_1.Schema)()
], ProjectQuestion);
let Project = class Project {
    title;
    description;
    pdfUrl;
    questions;
    voteStart;
    voteEnd;
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
    (0, mongoose_1.Prop)({ type: [ProjectQuestion], required: true }),
    __metadata("design:type", Array)
], Project.prototype, "questions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Project.prototype, "voteStart", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Project.prototype, "voteEnd", void 0);
exports.Project = Project = __decorate([
    (0, mongoose_1.Schema)()
], Project);
exports.ProjectSchema = mongoose_1.SchemaFactory.createForClass(Project);
//# sourceMappingURL=project.schema.js.map