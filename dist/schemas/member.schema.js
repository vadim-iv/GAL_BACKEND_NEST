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
exports.MemberSchema = exports.Member = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const text_schema_1 = require("./shared/text.schema");
const member_enum_1 = require("../enums/member.enum");
let Member = class Member {
    email;
    password;
    name;
    details;
    shortDetails;
    imageUrl;
    roles;
    resetPasswordTokenHash;
    resetPasswordTokenExpires;
};
exports.Member = Member;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false, unique: true, sparse: true }),
    __metadata("design:type", String)
], Member.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Member.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], Member.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: false }),
    __metadata("design:type", text_schema_1.MultiLangText)
], Member.prototype, "details", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: text_schema_1.MultiLangText, required: true }),
    __metadata("design:type", text_schema_1.MultiLangText)
], Member.prototype, "shortDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Member.prototype, "imageUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], enum: member_enum_1.MemberRolesEnum, required: true }),
    __metadata("design:type", Array)
], Member.prototype, "roles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], Member.prototype, "resetPasswordTokenHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: false }),
    __metadata("design:type", Date)
], Member.prototype, "resetPasswordTokenExpires", void 0);
exports.Member = Member = __decorate([
    (0, mongoose_1.Schema)()
], Member);
exports.MemberSchema = mongoose_1.SchemaFactory.createForClass(Member);
//# sourceMappingURL=member.schema.js.map