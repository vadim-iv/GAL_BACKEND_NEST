import {
	Body,
	Controller,
	Delete,
	Get,
	Header,
	HttpCode,
	Param,
	Patch,
	Post,
	Put,
	Query,
	StreamableFile,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { LocalCallService } from './local-call.service'
import { GetLocalCallsDto } from './dto/get-local-calls.dto'
import { LocalCallDto } from './dto/local-call.dto'
import { UpdateLocalCallDto } from './dto/update-local-call.dto'
import { ProjectDto } from './dto/project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { AddLocalCallAnswersDto } from './dto/add-answers.dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { MemberAuth } from 'src/auth/decorators/member-auth.decorator'
import { DeleteImagesDto } from 'src/blogs/dto/delete-images.dto'
import { ResultsPdfLang } from 'src/common/pdf/results-pdf.builder'

@Controller('local-call')
export class LocalCallController {
	constructor(private readonly localCallService: LocalCallService) {}

	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	async getAll(@Query() dto: GetLocalCallsDto) {
		return this.localCallService.getAll(dto)
	}

	@Get(':id')
	async getById(@Param('id') id: string) {
		return this.localCallService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth()
	async create(@Body() dto: LocalCallDto) {
		return this.localCallService.create(dto)
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
	async update(@Param('id') id: string, @Body() dto: UpdateLocalCallDto) {
		return this.localCallService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth()
	async delete(@Param('id') id: string) {
		return this.localCallService.delete(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post(':id/project')
	@Auth()
	async addProject(@Param('id') id: string, @Body() dto: ProjectDto) {
		return this.localCallService.addProject(id, dto)
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
	@Put(':id/project/:projectId')
	@Auth()
	async updateProject(
		@Param('id') id: string,
		@Param('projectId') projectId: string,
		@Body() dto: UpdateProjectDto
	) {
		return this.localCallService.updateProject(id, projectId, dto)
	}

	@HttpCode(200)
	@Delete(':id/project/:projectId')
	@Auth()
	async deleteProject(@Param('id') id: string, @Param('projectId') projectId: string) {
		return this.localCallService.deleteProject(id, projectId)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Patch(':id/project/:projectId/status')
	@Auth()
	async updateProjectStatus(
		@Param('id') id: string,
		@Param('projectId') projectId: string,
		@Body() dto: UpdateStatusDto
	) {
		return this.localCallService.updateProjectStatus(id, projectId, dto.status)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post('add-answers')
	@MemberAuth()
	async addAnswers(@Body() dto: AddLocalCallAnswersDto) {
		return this.localCallService.addAnswers(dto)
	}

	// For PDF upload
	@HttpCode(200)
	@Post('generate-upload-link')
	@Auth()
	async generateFileUploadLink() {
		return this.localCallService.generateFileUploadLink()
	}

	// For image upload
	@HttpCode(200)
	@Post('generate-image-upload-link')
	@Auth()
	async generateImageUploadLink() {
		return this.localCallService.generateImageUploadLink()
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@HttpCode(200)
	@Post('delete-files')
	@Auth()
	async deleteFiles(@Body() dto: DeleteImagesDto) {
		return this.localCallService.deleteDocuments(dto.imageUrls)
	}

	@Header('Content-Type', 'application/pdf')
	@Header('Content-Disposition', 'attachment; filename="local-call-results.pdf"')
	@HttpCode(200)
	@Post(':id/results-pdf')
	@Auth()
	async generateResultsPdf(@Param('id') id: string, @Query('lang') lang?: ResultsPdfLang) {
		const buffer = await this.localCallService.generateResultsPdf(id, lang)
		return new StreamableFile(buffer)
	}
}
