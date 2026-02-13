import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { MembersService } from 'src/members/members.service'

@Injectable()
export class MembersJwtStrategy extends PassportStrategy(Strategy, 'member-jwt') {
	constructor(
		private configService: ConfigService,
		private membersService: MembersService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: configService.get<string>('JWT_SECRET') || "49)@',5BKi~W"
		})
	}

	async validate({ id }: { id: string }) {
		const memberDoc = await this.membersService.getById(id)
		if (!memberDoc) return null
		return memberDoc.toObject()
	}
}
