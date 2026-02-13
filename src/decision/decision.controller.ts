import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common'
import { DecisionService } from './decision.service'
import { GetDecisionsDto } from './dto/get-decisions.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { DecisionDto } from './dto/decision.dto'
import { MemberAuth } from 'src/auth/decorators/member-auth.decorator'
import { AddDecisionAnswersDto } from './dto/add-answers.dto'
import { UpdateDecisionDto } from './dto/update-decision-dto'

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
}
