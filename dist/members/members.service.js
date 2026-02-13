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
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const member_schema_1 = require("../schemas/member.schema");
const argon2_1 = require("argon2");
const nodemailer = require("nodemailer");
let MembersService = class MembersService {
    memberModel;
    constructor(memberModel) {
        this.memberModel = memberModel;
    }
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD
        },
        host: 'smtp.gmail.com',
        port: 587,
        secure: false
    });
    generateRandomPassword(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
    createHtmlMessageCreation(email, password) {
        return `
        <div style="font-family: Arial, sans-serif; background: #F6F6F6; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #FFFEFD; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 24px;">
                <h2 style="color: #11200B; margin-top: 0;">Bun venit în GAL - Contul tău a fost creat</h2>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                <p style="color: #11200B;">Contul tău de membru a fost creat cu succes. Aici sunt datele tale de acces:</p>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                <p style="color: #11200B;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p style="color: #11200B;"><strong>Parolă:</strong> <code style="background: #4C833230; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 1.1em;">${password}</code></p>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 24px 0 8px 0;">
                <p style="font-size: 0.95em; color: #888;">Acest mesaj a fost trimis automat de sistemul GAL.</p>
            </div>
        </div>
    `;
    }
    createHtmlMessageReset(email, password) {
        return `
        <div style="font-family: Arial, sans-serif; background: #F6F6F6; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #FFFEFD; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 24px;">
                <h2 style="color: #11200B; margin-top: 0;">Resetare parolă - GAL</h2>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                <p style="color: #11200B;">Parola ta a fost resetată cu succes. Aici sunt noile tale date de acces:</p>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                <p style="color: #11200B;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p style="color: #11200B;"><strong>Parolă:</strong> <code style="background: #4C833230; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 1.1em;">${password}</code></p>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 24px 0 8px 0;">
                <p style="font-size: 0.95em; color: #888;">Acest mesaj a fost trimis automat de sistemul GAL.</p>
            </div>
        </div>
    `;
    }
    findAll() {
        return this.memberModel.find().exec();
    }
    getById(id) {
        return this.memberModel.findById(id).exec();
    }
    getByEmail(email) {
        return this.memberModel.findOne({ email }).exec();
    }
    async create(dto) {
        const password = this.generateRandomPassword();
        const hashedPassword = await (0, argon2_1.hash)(password);
        const member = await this.memberModel.create({
            ...dto,
            password: hashedPassword
        });
        await this.transporter.sendMail({
            from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
            to: dto.email,
            subject: 'Bun venit în GAL - Contul tău a fost creat',
            html: this.createHtmlMessageCreation(dto.email, password),
            replyTo: process.env.SMTP_USERNAME
        });
        return member.toObject();
    }
    async update(id, dto) {
        if (!dto || Object.keys(dto).length === 0)
            throw new common_1.BadRequestException('No data provided');
        let data = dto;
        return this.memberModel.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        const member = await this.memberModel.findByIdAndDelete(id).exec();
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        return member;
    }
    async resetPassword(email) {
        const member = await this.getByEmail(email);
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        const newPassword = this.generateRandomPassword();
        const hashedPassword = await (0, argon2_1.hash)(newPassword);
        await this.memberModel.findByIdAndUpdate(member._id, { password: hashedPassword }).exec();
        await this.transporter.sendMail({
            from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
            to: email,
            subject: 'Resetare parolă - GAL',
            html: this.createHtmlMessageReset(email, newPassword),
            replyTo: process.env.SMTP_USERNAME
        });
        return { message: 'Password reset successfully' };
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(member_schema_1.Member.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MembersService);
//# sourceMappingURL=members.service.js.map