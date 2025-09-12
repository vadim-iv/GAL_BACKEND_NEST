import { BadRequestException, Injectable } from '@nestjs/common'

import * as nodemailer from 'nodemailer'
import { ContactFormDto } from './dto/contact-form.dto'

@Injectable()
export class ContactService {
	private transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.SMTP_USERNAME,
			pass: process.env.SMTP_PASSWORD
		},
		host: 'smtp.gmail.com',
		port: 587,
		secure: false
	})

	createHtmlMessage(dto: ContactFormDto): string {
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
        `
	}

	async sendToGal(dto: ContactFormDto) {
		const response = await this.transporter.sendMail({
			from: `"GAL Contact Form" <${dto.email}>`,
			to: process.env.SMTP_DEST,
			subject: dto.subject,
			text: dto.message,
			html: this.createHtmlMessage(dto),
			replyTo: dto.email
		})

		if (!response) throw new BadRequestException('Failed to send email')

		return response
	}
}
