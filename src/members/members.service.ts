import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Member } from 'src/schemas/member.schema'
import { MemberDto } from './dto/member.dto'
import { hash } from 'argon2'
import * as nodemailer from 'nodemailer'
import * as crypto from 'crypto'
import { UpdateMemberDto } from './dto/update-member.dto'
import { ManagementService } from 'src/management/management.service'
import { AwsService } from 'src/aws/aws.service'
import { MemberRolesEnum } from 'src/enums/member.enum'

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

@Injectable()
export class MembersService {
	private readonly logger = new Logger(MembersService.name)

	constructor(
		@InjectModel(Member.name) private memberModel: Model<Member>,
		private readonly managementService: ManagementService,
		private readonly awsService: AwsService
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

	private createHtmlMessageResetLink(resetUrl: string): string {
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
		const existingMember = await this.getByEmail(dto.email)
		if (existingMember) throw new BadRequestException('Member with this email already exists')

		if (dto.roles?.includes(MemberRolesEnum.PRESIDENT)) {
			const presidentExists = await this.memberModel.exists({ roles: MemberRolesEnum.PRESIDENT })
			if (presidentExists) {
				throw new BadRequestException('A president already exists — remove or reassign them first')
			}
		}

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

		if (dto.roles?.includes(MemberRolesEnum.PRESIDENT)) {
			const presidentExists = await this.memberModel.exists({
				roles: MemberRolesEnum.PRESIDENT,
				_id: { $ne: id }
			})
			if (presidentExists) {
				throw new BadRequestException('A president already exists — remove or reassign them first')
			}
		}

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

	// Step 1 of the public forgot-password flow: email a reset LINK (not a
	// password). Silently no-ops for an unknown email — the response must not
	// reveal whether an account exists.
	async forgotPassword(email: string) {
		const member = await this.getByEmail(email)
		if (!member) return { message: 'If that email exists, a reset link has been sent' }

		const token = crypto.randomBytes(32).toString('hex')
		const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

		await this.memberModel
			.findByIdAndUpdate(member._id, {
				resetPasswordTokenHash: tokenHash,
				resetPasswordTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS)
			})
			.exec()

		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
		const resetUrl = `${frontendUrl}/voting/reset-password?token=${token}`

		await this.transporter.sendMail({
			from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
			to: email,
			subject: 'Resetare parolă - GAL',
			html: this.createHtmlMessageResetLink(resetUrl),
			replyTo: process.env.SMTP_USERNAME
		})

		return { message: 'If that email exists, a reset link has been sent' }
	}

	// Step 2: the member clicked the link and confirmed. Validate the token,
	// then reuse the exact same "generate + email a new password" logic as the
	// admin-triggered resetPassword() above.
	async confirmPasswordReset(token: string) {
		const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

		const member = await this.memberModel
			.findOne({ resetPasswordTokenHash: tokenHash, resetPasswordTokenExpires: { $gt: new Date() } })
			.exec()
		if (!member) throw new BadRequestException('This reset link is invalid or has expired')

		const newPassword = this.generateRandomPassword()
		const hashedPassword = await hash(newPassword)

		await this.memberModel
			.findByIdAndUpdate(member._id, {
				password: hashedPassword,
				resetPasswordTokenHash: null,
				resetPasswordTokenExpires: null
			})
			.exec()

		await this.transporter.sendMail({
			from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
			to: member.email,
			subject: 'Resetare parolă - GAL',
			html: this.createHtmlMessageReset(member.email, newPassword),
			replyTo: process.env.SMTP_USERNAME
		})

		return { message: 'A new password has been sent to your email' }
	}

	// For image upload

	async generateImageUploadLink() {
		return this.awsService.generateUploadLink('MEMBERS')
	}

	async deleteMemberImages(imageUrls: string[]) {
		return this.awsService.deleteImages(imageUrls)
	}
}
