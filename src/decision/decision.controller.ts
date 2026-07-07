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
import { DecisionService } from './decision.service'
import { GetDecisionsDto } from './dto/get-decisions.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { DecisionDto } from './dto/decision.dto'
import { MemberAuth } from 'src/auth/decorators/member-auth.decorator'
import { AddDecisionAnswersDto } from './dto/add-answers.dto'
import { UpdateDecisionDto } from './dto/update-decision-dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { DeleteImagesDto } from 'src/blogs/dto/delete-images.dto'
import { ResultsPdfLang } from 'src/common/pdf/results-pdf.builder'

@Controller('decision')
export class DecisionController {
	constructor(private readonly decisionService: DecisionService) {}

	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	async getAll(@Query() getDecisionsDto: GetDecisionsDto) {
		return this.decisionService.getAll(getDecisionsDto)
	}

	@Get(':id')
	async getById(@Param('id') id: string) {
		return this.decisionService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth()
	async create(@Body() dto: DecisionDto) {
		return this.decisionService.create(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post('add-answers')
	@MemberAuth()
	async addAnswers(@Body() dto: AddDecisionAnswersDto) {
		return this.decisionService.addAnswers(dto)
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
	async update(@Param('id') id: string, @Body() dto: UpdateDecisionDto) {
		return this.decisionService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth()
	async delete(@Param('id') id: string) {
		return this.decisionService.delete(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Patch(':id/status')
	@Auth()
	async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
		return this.decisionService.updateStatus(id, dto.status)
	}

	// For image upload
	@HttpCode(200)
	@Post('generate-image-upload-link')
	@Auth()
	async generateImageUploadLink() {
		return this.decisionService.generateImageUploadLink()
	}

	@UsePipes(new ValidationPipe({ transform: true }))
	@HttpCode(200)
	@Post('delete-files')
	@Auth()
	async deleteFiles(@Body() dto: DeleteImagesDto) {
		return this.decisionService.deleteFiles(dto.imageUrls)
	}

	@Header('Content-Type', 'application/pdf')
	@Header('Content-Disposition', 'attachment; filename="decision-results.pdf"')
	@HttpCode(200)
	@Post(':id/results-pdf')
	@Auth()
	async generateResultsPdf(@Param('id') id: string, @Query('lang') lang?: ResultsPdfLang) {
		const buffer = await this.decisionService.generateResultsPdf(id, lang)
		return new StreamableFile(buffer)
	}
}
