import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { MembersService } from 'src/members/members.service'
import { MemberAuthDto } from '../dto/member-auth.dto'
import { verify } from 'argon2'
import { Response } from 'express'

@Injectable()
export class MembersAuthService {
	REFRESH_TOKEN_NAME = 'memberRefreshToken'
	EXPIRE_DAY_REFRESH_TOKEN = 7

	constructor(
		private jwt: JwtService,
		private membersService: MembersService
	) {}

	async login(dto: MemberAuthDto) {
		const { password, ...member } = (await this.validateMember(dto)).toObject()
		const tokens = this.issueTokens(member._id.toString())

		return {
			member,
			...tokens
		}
	}

	// helper methods

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken)

		if (!result) throw new UnauthorizedException('Invalid refresh token')

		const memberDoc = await this.membersService.getById(result.id)
		if (!memberDoc) throw new BadRequestException('Member not found')

		const { password, ...member } = memberDoc.toObject()

		const tokens = this.issueTokens(member._id.toString())

		return { member, ...tokens }
	}

	private issueTokens(memberId: string) {
		const data = { id: memberId }

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		})

		return { accessToken, refreshToken }
	}

	private async validateMember(dto: MemberAuthDto) {
		const member = await this.membersService.getByEmail(dto.email)

		if (!member) throw new NotFoundException('User not found')

		const isValid = await verify(member.password, dto.password)

		if (!isValid) throw new UnauthorizedException('Invalid password')

		return member
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			expires: expiresIn,
			secure: true,
			sameSite: 'none'
		})
	}

	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			expires: new Date(0),
			secure: true,
			sameSite: 'none'
		})
	}
}
