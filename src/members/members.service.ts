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

	private getLoginUrl(): string {
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
		return `${frontendUrl}/votare/login`
	}

	// Shared by every template that hands out a password — a CTA pointing
	// straight at the voting platform's login page, styled like the button in
	// createHtmlMessageResetLink, so the member knows where to actually use
	// these credentials.
	private loginCtaHtml(): string {
		const loginUrl = this.getLoginUrl()
		return `
                <p style="text-align: center; margin: 24px 0;">
                    <a href="${loginUrl}" style="background: #4C8332; color: #FFFEFD; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold; display: inline-block;">Accesează platforma de vot</a>
                </p>
`
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
                ${this.loginCtaHtml()}
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
                ${this.loginCtaHtml()}
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

	private createHtmlMessageEmailChanged(email: string, password: string): string {
		return `
        <div style="font-family: Arial, sans-serif; background: #F6F6F6; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #FFFEFD; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 24px;">
                <h2 style="color: #11200B; margin-top: 0;">Adresa contului tău GAL a fost actualizată</h2>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                <p style="color: #11200B;">Adresa de email a contului tău de membru a fost schimbată de un administrator. Din motive de securitate, a fost generată o parolă nouă. Aici sunt noile tale date de acces:</p>
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 16px 0;">
                <p style="color: #11200B;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p style="color: #11200B;"><strong>Parolă:</strong> <code style="background: #4C833230; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 1.1em;">${password}</code></p>
                ${this.loginCtaHtml()}
                <hr style="border: none; border-top: 1px solid #BFBFBE; margin: 24px 0 8px 0;">
                <p style="font-size: 0.95em; color: #888;">Acest mesaj a fost trimis automat de sistemul GAL.</p>
            </div>
        </div>
    `
	}

	private createHtmlMessageAccountRemoved(email: string): string {
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

	private async assertEmailAvailable(email: string, excludeMemberId?: string): Promise<void> {
		const existingMember = await this.getByEmail(email)
		if (existingMember && existingMember._id.toString() !== excludeMemberId) {
			throw new BadRequestException('Member with this email already exists')
		}
	}

	// Turns an email into a working login account: validates uniqueness, generates
	// + hashes a password, emails the welcome message. Returns the hashed password
	// for the caller to persist (create() and update() persist differently, so
	// persistence itself stays out of this helper).
	private async provisionAccountForEmail(email: string, excludeMemberId?: string): Promise<string> {
		await this.assertEmailAvailable(email, excludeMemberId)

		const password = this.generateRandomPassword()
		const hashedPassword = await hash(password)

		await this.transporter.sendMail({
			from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
			to: email,
			subject: 'Bun venit în GAL - Contul tău a fost creat',
			html: this.createHtmlMessageCreation(email, password),
			replyTo: process.env.SMTP_USERNAME
		})

		return hashedPassword
	}

	private async notifyAccountRemoved(oldEmail: string): Promise<void> {
		await this.transporter.sendMail({
			from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
			to: oldEmail,
			subject: 'Acces GAL revocat',
			html: this.createHtmlMessageAccountRemoved(oldEmail),
			replyTo: process.env.SMTP_USERNAME
		})
	}

	// Existing account, address swapped to a different non-empty value: a fresh
	// password for the new address (the old one was only ever communicated to
	// the old address, so it can't carry over), plus a removal notice to the
	// old address.
	private async reprovisionAccountForEmailChange(newEmail: string, oldEmail: string, memberId: string): Promise<string> {
		await this.assertEmailAvailable(newEmail, memberId)

		const password = this.generateRandomPassword()
		const hashedPassword = await hash(password)

		await this.transporter.sendMail({
			from: `"GAL Admin" <${process.env.SMTP_USERNAME}>`,
			to: newEmail,
			subject: 'Adresa contului tău GAL a fost actualizată',
			html: this.createHtmlMessageEmailChanged(newEmail, password),
			replyTo: process.env.SMTP_USERNAME
		})

		await this.notifyAccountRemoved(oldEmail)

		return hashedPassword
	}

	async create(dto: MemberDto) {
		if (dto.roles?.includes(MemberRolesEnum.PRESIDENT)) {
			const presidentExists = await this.memberModel.exists({ roles: MemberRolesEnum.PRESIDENT })
			if (presidentExists) {
				throw new BadRequestException('A president already exists — remove or reassign them first')
			}
		}

		const hashedPassword = dto.email ? await this.provisionAccountForEmail(dto.email) : undefined

		// An empty-string email must never be persisted as a literal '' — the
		// schema's unique index is sparse (allows many documents with the field
		// entirely absent), but sparse does NOT exempt an explicit '' value, so a
		// second no-email member would collide on it.
		const { email, ...memberData } = dto

		const member = await this.memberModel.create({
			...memberData,
			...(email ? { email } : {}),
			...(hashedPassword ? { password: hashedPassword } : {})
		})

		await this.syncManagement()

		return member.toObject()
	}

	async update(id: string, dto: UpdateMemberDto) {
		if (!dto || Object.keys(dto).length === 0) throw new BadRequestException('No data provided')

		const existingMember = await this.memberModel.findById(id)
		if (!existingMember) throw new NotFoundException('Member not found')

		if (dto.roles?.includes(MemberRolesEnum.PRESIDENT)) {
			const presidentExists = await this.memberModel.exists({
				roles: MemberRolesEnum.PRESIDENT,
				_id: { $ne: id }
			})
			if (presidentExists) {
				throw new BadRequestException('A president already exists — remove or reassign them first')
			}
		}

		const { email: newEmail, ...restDto } = dto
		const setFields: Partial<Member> = { ...restDto }
		const unsetFields: Record<string, ''> = {}

		const oldEmail = existingMember.email
		// The admin edit form always sends `email` as a real string ('' when
		// cleared) — omission is only possible from a non-frontend caller, and is
		// defensively treated as "no intent to change email".
		const emailProvided = newEmail !== undefined

		if (!emailProvided || (!oldEmail && !newEmail) || (oldEmail && newEmail === oldEmail)) {
			// No email before and none now, or resubmitted unchanged — nothing to do.
		} else if (!oldEmail && newEmail) {
			// Retroactive account creation: member had no login, admin just gave them one.
			setFields.email = newEmail
			setFields.password = await this.provisionAccountForEmail(newEmail, id)
		} else if (oldEmail && newEmail) {
			// Changed to a different non-empty address.
			setFields.email = newEmail
			setFields.password = await this.reprovisionAccountForEmailChange(newEmail, oldEmail, id)
			// A reset-link token issued under the old email identity shouldn't
			// remain redeemable after the identity it was tied to just changed.
			unsetFields.resetPasswordTokenHash = ''
			unsetFields.resetPasswordTokenExpires = ''
		} else if (oldEmail && !newEmail) {
			// Cleared — revoke access, don't issue a new password.
			await this.notifyAccountRemoved(oldEmail)
			unsetFields.email = ''
			unsetFields.password = ''
			unsetFields.resetPasswordTokenHash = ''
			unsetFields.resetPasswordTokenExpires = ''
		}

		const updateOp: Record<string, unknown> = { $set: setFields }
		if (Object.keys(unsetFields).length > 0) updateOp.$unset = unsetFields

		const member = await this.memberModel.findByIdAndUpdate(id, updateOp, { new: true })

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
		const resetUrl = `${frontendUrl}/votare/reset-password?token=${token}`

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
		// A reset token can only ever have been issued to a member found via
		// getByEmail() in forgotPassword(), so email is guaranteed present here —
		// this check is just making that invariant explicit for the type checker.
		if (!member || !member.email) throw new BadRequestException('This reset link is invalid or has expired')

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
