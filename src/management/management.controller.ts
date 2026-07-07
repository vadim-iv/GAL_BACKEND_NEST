import { Body, Controller, Get, HttpCode, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { ManagementService } from './management.service'
import { ApiTags } from '@nestjs/swagger'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { UpdateMainImageDto } from './dto/update-main-image.dto'

@ApiTags('🛠️ Management')
@Controller('management')
export class ManagementController {
	constructor(private readonly managementService: ManagementService) {}

	@Get()
	async getManagement() {
		return this.managementService.getManagement()
	}

	@Patch('main-image')
	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Auth()
	async updateMainImage(@Body() dto: UpdateMainImageDto) {
		return this.managementService.updateMainImage(dto.main_image)
	}

	// Manually recompute the management document from the current members collection.
	// Runs automatically after member create/update/delete; exposed here as a backfill/recovery tool.
	@Post('sync')
	@HttpCode(200)
	@Auth()
	async sync() {
		await this.managementService.syncFromMembers()
		return this.managementService.getManagement()
	}
}
