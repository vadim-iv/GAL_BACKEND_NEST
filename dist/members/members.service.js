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
var MembersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const member_schema_1 = require("../schemas/member.schema");
const argon2_1 = require("argon2");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const management_service_1 = require("../management/management.service");
const aws_service_1 = require("../aws/aws.service");
const member_enum_1 = require("../enums/member.enum");
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
let MembersService = MembersService_1 = class MembersService {
    memberModel;
    managementService;
    awsService;
    logger = new common_1.Logger(MembersService_1.name);
    constructor(memberModel, managementService, awsService) {
        this.memberModel = memberModel;
        this.managementService = managementService;
        this.awsService = awsService;
    }
    async syncManagement() {
        try {
            await this.managementService.syncFromMembers();
        }
        catch (err) {
            this.logger.error('Failed to sync management from members', err);
        }
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
    createHtmlMessageResetLink(resetUrl) {
        return `
        <div style="font-family: Arial, sans-serif; background: #F6F6F6; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #FFFEFD; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 24px;">
                <h2 style="color: #11200B; margin-top: 0;">Resetare parolă - GAL</h2>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                <p style="color: #11200B;">Am primit o cerere de resetare a parolei contului tău. Apasă pe butonul de mai jos pentru a continua:</p>
                <p style="text-align: center; margin: 24px 0;">
                    <a href="${resetUrl}" style="background: #4C8332; color: #FFFEFD; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold; display: inline-block;">Resetează parola</a>
                </p>
                <p style="color: #888; font-size: 0.9em;">Acest link este valabil timp de o oră. Dacă nu ai solicitat resetarea parolei, poți ignora acest mesaj.</p>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 24px 0 8px 0;">
                <p style="font-size: 0.95em; color: #888;">Acest mesaj a fost trimis automat de sistemul GAL.</p>
            </div>
        </div>
    `;
    }
    createHtmlMessageEmailChanged(email, password) {
        return `
        <div style="font-family: Arial, sans-serif; background: #F6F6F6; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #FFFEFD; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 24px;">
                <h2 style="color: #11200B; margin-top: 0;">Adresa contului tău GAL a fost actualizată</h2>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                <p style="color: #11200B;">Adresa de email a contului tău de membru a fost schimbată de un administrator. Din motive de securitate, a fost generată o parolă nouă. Aici sunt noile tale date de acces:</p>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                <p style="color: #11200B;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p style="color: #11200B;"><strong>Parolă:</strong> <code style="background: #4C833230; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 1.1em;">${password}</code></p>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 24px 0 8px 0;">
                <p style="font-size: 0.95em; color: #888;">Acest mesaj a fost trimis automat de sistemul GAL.</p>
            </div>
        </div>
    `;
    }
    createHtmlMessageAccountRemoved(email) {
        return `
        <div style="font-family: Arial, sans-serif; background: #F6F6F6; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #FFFEFD; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 24px;">
                <h2 style="color: #11200B; margin-top: 0;">Acces GAL revocat</h2>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                <p style="color: #11200B;">Contul de membru GAL asociat adresei <strong>${email}</strong> a fost eliminat de un administrator. Această adresă nu mai are acces la platforma de vot GAL.</p>
                <p style="color: #11200B;">Dacă acest lucru nu ți se pare corect, te rugăm să contactezi un administrator.</p>
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
    async assertEmailAvailable(email, excludeMemberId) {
        const existingMember = await this.getByEmail(email);
        if (existingMember && existingMember._id.toString() !== excludeMemberId) {
            throw new common_1.BadRequestException('Member with this email already exists');
        }
    }
    async provisionAccountForEmail(email, excludeMemberId) {
        await this.assertEmailAvailable(email, excludeMemberId);
        const password = this.generateRandomPassword();
        const hashedPassword = await (0, argon2_1.hash)(password);
        await this.transporter.sendMail({
            from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
            to: email,
            subject: 'Bun venit în GAL - Contul tău a fost creat',
            html: this.createHtmlMessageCreation(email, password),
            replyTo: process.env.SMTP_USERNAME
        });
        return hashedPassword;
    }
    async notifyAccountRemoved(oldEmail) {
        await this.transporter.sendMail({
            from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
            to: oldEmail,
            subject: 'Acces GAL revocat',
            html: this.createHtmlMessageAccountRemoved(oldEmail),
            replyTo: process.env.SMTP_USERNAME
        });
    }
    async reprovisionAccountForEmailChange(newEmail, oldEmail, memberId) {
        await this.assertEmailAvailable(newEmail, memberId);
        const password = this.generateRandomPassword();
        const hashedPassword = await (0, argon2_1.hash)(password);
        await this.transporter.sendMail({
            from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
            to: newEmail,
            subject: 'Adresa contului tău GAL a fost actualizată',
            html: this.createHtmlMessageEmailChanged(newEmail, password),
            replyTo: process.env.SMTP_USERNAME
        });
        await this.notifyAccountRemoved(oldEmail);
        return hashedPassword;
    }
    async create(dto) {
        if (dto.roles?.includes(member_enum_1.MemberRolesEnum.PRESIDENT)) {
            const presidentExists = await this.memberModel.exists({ roles: member_enum_1.MemberRolesEnum.PRESIDENT });
            if (presidentExists) {
                throw new common_1.BadRequestException('A president already exists — remove or reassign them first');
            }
        }
        const hashedPassword = dto.email ? await this.provisionAccountForEmail(dto.email) : undefined;
        const { email, ...memberData } = dto;
        const member = await this.memberModel.create({
            ...memberData,
            ...(email ? { email } : {}),
            ...(hashedPassword ? { password: hashedPassword } : {})
        });
        await this.syncManagement();
        return member.toObject();
    }
    async update(id, dto) {
        if (!dto || Object.keys(dto).length === 0)
            throw new common_1.BadRequestException('No data provided');
        const existingMember = await this.memberModel.findById(id);
        if (!existingMember)
            throw new common_1.NotFoundException('Member not found');
        if (dto.roles?.includes(member_enum_1.MemberRolesEnum.PRESIDENT)) {
            const presidentExists = await this.memberModel.exists({
                roles: member_enum_1.MemberRolesEnum.PRESIDENT,
                _id: { $ne: id }
            });
            if (presidentExists) {
                throw new common_1.BadRequestException('A president already exists — remove or reassign them first');
            }
        }
        const { email: newEmail, ...restDto } = dto;
        const setFields = { ...restDto };
        const unsetFields = {};
        const oldEmail = existingMember.email;
        const emailProvided = newEmail !== undefined;
        if (!emailProvided || (!oldEmail && !newEmail) || (oldEmail && newEmail === oldEmail)) {
        }
        else if (!oldEmail && newEmail) {
            setFields.email = newEmail;
            setFields.password = await this.provisionAccountForEmail(newEmail, id);
        }
        else if (oldEmail && newEmail) {
            setFields.email = newEmail;
            setFields.password = await this.reprovisionAccountForEmailChange(newEmail, oldEmail, id);
            unsetFields.resetPasswordTokenHash = '';
            unsetFields.resetPasswordTokenExpires = '';
        }
        else if (oldEmail && !newEmail) {
            await this.notifyAccountRemoved(oldEmail);
            unsetFields.email = '';
            unsetFields.password = '';
            unsetFields.resetPasswordTokenHash = '';
            unsetFields.resetPasswordTokenExpires = '';
        }
        const updateOp = { $set: setFields };
        if (Object.keys(unsetFields).length > 0)
            updateOp.$unset = unsetFields;
        const member = await this.memberModel.findByIdAndUpdate(id, updateOp, { new: true });
        await this.syncManagement();
        return member;
    }
    async delete(id) {
        const member = await this.memberModel.findByIdAndDelete(id).exec();
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        await this.syncManagement();
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
    async forgotPassword(email) {
        const member = await this.getByEmail(email);
        if (!member)
            return { message: 'If that email exists, a reset link has been sent' };
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        await this.memberModel
            .findByIdAndUpdate(member._id, {
            resetPasswordTokenHash: tokenHash,
            resetPasswordTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS)
        })
            .exec();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/votare/reset-password?token=${token}`;
        await this.transporter.sendMail({
            from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
            to: email,
            subject: 'Resetare parolă - GAL',
            html: this.createHtmlMessageResetLink(resetUrl),
            replyTo: process.env.SMTP_USERNAME
        });
        return { message: 'If that email exists, a reset link has been sent' };
    }
    async confirmPasswordReset(token) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const member = await this.memberModel
            .findOne({ resetPasswordTokenHash: tokenHash, resetPasswordTokenExpires: { $gt: new Date() } })
            .exec();
        if (!member || !member.email)
            throw new common_1.BadRequestException('This reset link is invalid or has expired');
        const newPassword = this.generateRandomPassword();
        const hashedPassword = await (0, argon2_1.hash)(newPassword);
        await this.memberModel
            .findByIdAndUpdate(member._id, {
            password: hashedPassword,
            resetPasswordTokenHash: null,
            resetPasswordTokenExpires: null
        })
            .exec();
        await this.transporter.sendMail({
            from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
            to: member.email,
            subject: 'Resetare parolă - GAL',
            html: this.createHtmlMessageReset(member.email, newPassword),
            replyTo: process.env.SMTP_USERNAME
        });
        return { message: 'A new password has been sent to your email' };
    }
    async generateImageUploadLink() {
        return this.awsService.generateUploadLink('MEMBERS');
    }
    async deleteMemberImages(imageUrls) {
        return this.awsService.deleteImages(imageUrls);
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = MembersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(member_schema_1.Member.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        management_service_1.ManagementService,
        aws_service_1.AwsService])
], MembersService);
//# sourceMappingURL=members.service.js.map