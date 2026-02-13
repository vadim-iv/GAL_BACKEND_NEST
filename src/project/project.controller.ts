import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common'
import { ProjectService } from './project.service'
import { GetProjectsDto } from './dto/get-projects.dto'
import { ProjectDto } from './dto/project.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { UpdateProjectDto } from './dto/update-project.dto'
import { DeleteImagesDto } from 'src/blogs/dto/delete-images.dto'
import { MemberAuth } from 'src/auth/decorators/member-auth.decorator'
import { AddAnswersDto } from './dto/add-answers.dto'

@Controller('project')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	async getAll(@Query() getProjectsDto: GetProjectsDto) {
		return this.projectService.getAll(getProjectsDto)
	}

	@Get(':id')
	async getById(@Param('id') id: string) {
		return this.projectService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth()
	async create(@Body() dto: ProjectDto) {
		return this.projectService.create(dto)
	}

  @UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post("add-answers")
	@MemberAuth()
	async addAnswers(@Body() dto: AddAnswersDto) {
		return this.projectService.addAnswers(dto)
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
	async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
		return this.projectService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth()
	async delete(@Param('id') id: string) {
		return this.projectService.delete(id)
	}

	// For image upload
	@HttpCode(200)
	@Post('/generate-upload-link')
	@Auth()
	async generateFileUploadLink() {
		return this.projectService.generateFileUploadLink()
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@HttpCode(200)
	@Post('delete-files')
	@Auth()
	async deleteProjectFiles(@Body() dto: DeleteImagesDto) {
		return this.projectService.deleteDocuments(dto.imageUrls)
	}
}
