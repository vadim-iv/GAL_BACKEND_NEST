import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { MembersService } from './members.service'
import { MemberSeedService } from './member-seed.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { MemberDto } from './dto/member.dto'
import { UpdateMemberDto } from './dto/update-member.dto'
import { MemberAuth } from 'src/auth/decorators/member-auth.decorator'
import { DeleteImagesDto } from 'src/blogs/dto/delete-images.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto'

@Controller('members')
export class MembersController {
	constructor(
		private readonly membersService: MembersService,
		private readonly memberSeedService: MemberSeedService
	) {}

	@Get()
	findAll() {
		return this.membersService.findAll()
	}

	@Get(':id')
	async getById(@Param('id') id: string) {
		return this.membersService.getById(id)
	}

	@Get('email/:email')
	async getByEmail(@Param('email') email: string) {
		return this.membersService.getByEmail(email)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth()
	async create(@Body() dto: MemberDto) {
		return this.membersService.create(dto)
	}

  @UsePipes(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
        skipMissingProperties: false
      })
    )
    @HttpCode(200)
    @Put(':id')
    @Auth()
    async update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
      return this.membersService.update(id, dto)
    }

	@HttpCode(200)
	@Delete(':id')
	@Auth()
	async delete(@Param('id') id: string) {
		return this.membersService.delete(id)
	}

	@HttpCode(200)
	@Post('generate-upload-link')
	@Auth()
	async generateImageUploadLink() {
		return this.membersService.generateImageUploadLink()
	}

	// TEMPORARY: manual trigger for the one-time member data migration — see
	// member-seed.service.ts. Remove this endpoint along with that service once
	// the real DB has been seeded.
	@HttpCode(200)
	@Post('run-seed')
	@Auth()
	async runSeed() {
		return this.memberSeedService.seed()
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@HttpCode(200)
	@Post('delete-files')
	@Auth()
	async deleteFiles(@Body() dto: DeleteImagesDto) {
		return this.membersService.deleteMemberImages(dto.imageUrls)
	}

    @HttpCode(200)
    @Post('reset-password')
    @MemberAuth()
    async resetPassword(@Body('email') email: string) {
      return this.membersService.resetPassword(email)
    }

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post('forgot-password')
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		return this.membersService.forgotPassword(dto.email)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post('confirm-password-reset')
	async confirmPasswordReset(@Body() dto: ConfirmPasswordResetDto) {
		return this.membersService.confirmPasswordReset(dto.token)
	}
}
