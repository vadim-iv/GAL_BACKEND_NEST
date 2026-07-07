import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Member } from 'src/schemas/member.schema'
import { MemberDto } from './dto/member.dto'
import { hash } from 'argon2'
import * as nodemailer from 'nodemailer'
import { UpdateMemberDto } from './dto/update-member.dto'
import { ManagementService } from 'src/management/management.service'

@Injectable()
export class MembersService {
	private readonly logger = new Logger(MembersService.name)

	constructor(
		@InjectModel(Member.name) private memberModel: Model<Member>,
		private readonly managementService: ManagementService
	) {}

	private async syncManagement() {
		try {
			await this.managementService.syncFromMembers()
		} catch (err) {
			this.logger.error('Failed to sync management from members', err)
		}
	}

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

	private generateRandomPassword(length: number = 8): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		let password = ''
		for (let i = 0; i < length; i++) {
			password += chars.charAt(Math.floor(Math.random() * chars.length))
		}
		return password
	}

	private createHtmlMessageCreation(email: string, password: string): string {
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
    `
	}

	private createHtmlMessageReset(email: string, password: string): string {
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
    `
	}

    findAll() {
        return this.memberModel.find().exec()
    }

	getById(id: string) {
		return this.memberModel.findById(id).exec()
	}

	getByEmail(email: string) {
		return this.memberModel.findOne({ email }).exec()
	}

	async create(dto: MemberDto) {
		const password = this.generateRandomPassword()
		const hashedPassword = await hash(password)

		const member = await this.memberModel.create({
			...dto,
			password: hashedPassword
		})

		await this.transporter.sendMail({
			from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
			to: dto.email,
			subject: 'Bun venit în GAL - Contul tău a fost creat',
			html: this.createHtmlMessageCreation(dto.email, password),
			replyTo: process.env.SMTP_USERNAME
		})

		await this.syncManagement()

		return member.toObject()
	}

	async update(id: string, dto: UpdateMemberDto) {
		if (!dto || Object.keys(dto).length === 0) throw new BadRequestException('No data provided')
		let data = dto

		const member = await this.memberModel.findByIdAndUpdate(id, data, { new: true })

		await this.syncManagement()

		return member
	}

	async delete(id: string) {
		const member = await this.memberModel.findByIdAndDelete(id).exec()
		if (!member) throw new NotFoundException('Member not found')

		await this.syncManagement()

		return member
	}

	async resetPassword(email: string) {
		const member = await this.getByEmail(email)
		if (!member) throw new NotFoundException('Member not found')

		const newPassword = this.generateRandomPassword()
		const hashedPassword = await hash(newPassword)

		await this.memberModel.findByIdAndUpdate(member._id, { password: hashedPassword }).exec()

		await this.transporter.sendMail({
			from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
			to: email,
			subject: 'Resetare parolă - GAL',
			html: this.createHtmlMessageReset(email, newPassword),
			replyTo: process.env.SMTP_USERNAME
		})

		return { message: 'Password reset successfully' }
	}
}
