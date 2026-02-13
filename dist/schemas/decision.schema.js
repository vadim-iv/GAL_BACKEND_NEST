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
exports.DecisionSchema = exports.Decision = exports.DecisionQuestion = exports.DecisionAnswer = exports.DecisionOption = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const text_schema_1 = require("./shared/text.schema");
const member_schema_1 = require("./member.schema");
const decision_enum_1 = require("../enums/decision.enum");
let DecisionOption = class DecisionOption {
    value;
    label;
};
exports.DecisionOption = DecisionOption;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DecisionOption.prototype, "value", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], DecisionOption.prototype, "label", void 0);
exports.DecisionOption = DecisionOption = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], DecisionOption);
let DecisionAnswer = class DecisionAnswer {
    memberId;
    value;
};
exports.DecisionAnswer = DecisionAnswer;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: member_schema_1.Member.name, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DecisionAnswer.prototype, "memberId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], DecisionAnswer.prototype, "value", void 0);
exports.DecisionAnswer = DecisionAnswer = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], DecisionAnswer);
let DecisionQuestion = class DecisionQuestion {
    _id;
    question;
    type;
    options;
    answers;
};
exports.DecisionQuestion = DecisionQuestion;
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], DecisionQuestion.prototype, "question", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: decision_enum_1.DecisionQuestionType, required: true }),
    __metadata("design:type", String)
], DecisionQuestion.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [DecisionOption], required: false }),
    __metadata("design:type", Array)
], DecisionQuestion.prototype, "options", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [DecisionAnswer], default: [] }),
    __metadata("design:type", Array)
], DecisionQuestion.prototype, "answers", void 0);
exports.DecisionQuestion = DecisionQuestion = __decorate([
    (0, mongoose_1.Schema)()
], DecisionQuestion);
let Decision = class Decision {
    title;
    description;
    questions;
    voteStart;
    voteEnd;
};
exports.Decision = Decision;
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], Decision.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], Decision.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [DecisionQuestion], required: true }),
    __metadata("design:type", Array)
], Decision.prototype, "questions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Decision.prototype, "voteStart", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Decision.prototype, "voteEnd", void 0);
exports.Decision = Decision = __decorate([
    (0, mongoose_1.Schema)()
], Decision);
exports.DecisionSchema = mongoose_1.SchemaFactory.createForClass(Decision);
//# sourceMappingURL=decision.schema.js.map