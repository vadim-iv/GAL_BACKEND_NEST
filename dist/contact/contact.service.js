"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let ContactService = class ContactService {
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
    createHtmlMessage(dto) {
        return `
            <div style="font-family: Arial, sans-serif; background: #F6F6F6; padding: 32px;">
                <div style="max-width: 600px; margin: auto; background: #FFFEFD; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 24px;">
                    <h2 style="color: #11200B; margin-top: 0;">Mesaj nou utilizând formularul de contact GAL</h2>
                    <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                    <p style="color: #11200B;"><strong>Subiect:</strong> ${dto.subject}</p>
                    <p style="color: #11200B;"><strong>Nume:</strong> ${dto.name} ${dto.surname}</p>
                    <p style="color: #11200B;"><strong>Email:</strong> <a href="mailto:${dto.email}">${dto.email}</a></p>
                    <p style="color: #11200B;"><strong>Telefon:</strong> ${dto.phone || '-'}</p>
                    <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                    <p style="font-size: 1.1em; color: #11200B;"><strong>Mesaj:</strong></p>
                    <div style="background: #4C833230; border-radius: 6px; padding: 16px; color: #222;">
                        ${dto.message.replace(/\n/g, '<br>')}
                    </div>
                    <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 24px 0 8px 0;">
                    <p style="font-size: 0.95em; color: #888;">Acest mesaj a fost trimis automat utilizând formularul de contact GAL.</p>
                </div>
            </div>
        `;
    }
    async sendToGal(dto) {
        const response = await this.transporter.sendMail({
            from: `"GAL Contact Form" <${dto.email}>`,
            to: process.env.SMTP_DEST,
            subject: dto.subject,
            text: dto.message,
            html: this.createHtmlMessage(dto),
            replyTo: dto.email
        });
        if (!response)
            throw new common_1.BadRequestException('Failed to send email');
        return response;
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)()
], ContactService);
//# sourceMappingURL=contact.service.js.map