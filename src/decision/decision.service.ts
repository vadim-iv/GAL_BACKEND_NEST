import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Decision, DecisionDocument, DecisionQuestion } from 'src/schemas/decision.schema'
import { GetDecisionsDto } from './dto/get-decisions.dto'
import { SortDirection } from 'src/enums/sorting.enum'
import { DecisionDto, DecisionQuestionDto } from './dto/decision.dto'
import { UpdateDecisionDto } from './dto/update-decision-dto'
import { AddDecisionAnswersDto } from './dto/add-answers.dto'
import { DecisionQuestionType } from 'src/enums/decision.enum'
import { ApprovalStatusEnum } from 'src/enums/status.enum'
import { AwsService } from 'src/aws/aws.service'
import { buildDecisionResultsPdf, ResultsPdfLang } from 'src/common/pdf/results-pdf.builder'

@Injectable()
export class DecisionService {
	constructor(
		@InjectModel(Decision.name)
		private decisionModel: Model<DecisionDocument>,
		private readonly awsService: AwsService
	) {}

	async getAll(dto: GetDecisionsDto) {
		const { page, limit, sort, sortDirection = SortDirection.DESC } = dto

		let query = this.decisionModel.find().populate('questions.answers.memberId', '_id name email')

		if (sort) {
			const sortOrder = sortDirection === SortDirection.ASC ? 1 : -1
			query = query.sort({ [sort]: sortOrder })
		}

		if (page && limit) {
			const skip = (page - 1) * limit
			query = query.skip(skip).limit(limit)
		}

		const projects = await query.exec()

		return projects
	}

	async getById(id: string) {
		const decision = await this.decisionModel
			.findById(id)
			.populate('questions.answers.memberId', '_id name email')
		if (!decision) throw new NotFoundException('Decision not found')
		return decision
	}

	async create(dto: DecisionDto) {
		this.validateQuestions(dto.questions)

		const decision = (await this.decisionModel.create(dto)).toObject()
		return decision
	}

	async update(id: string, dto: UpdateDecisionDto) {
		if (!dto || Object.keys(dto).length === 0) throw new BadRequestException('No data provided')
		let data = dto

		if (dto.questions) {
			this.validateQuestions(dto.questions)
		}

		const decision = await this.decisionModel.findById(id)
		if (!decision) throw new NotFoundException('Decision not found')

		return this.decisionModel.findByIdAndUpdate(id, data, { new: true })
	}

	async delete(id: string) {
		const decision = await this.decisionModel.findByIdAndDelete(id).exec()
		if (!decision) throw new NotFoundException('Decision not found')
		return decision
	}

	// Add answers to a decision
	async addAnswers(dto: AddDecisionAnswersDto) {
		const { decisionId, answers } = dto

		const decision = await this.decisionModel.findById(decisionId)
		if (!decision) throw new NotFoundException('Decision not found') 

		const now = new Date()
		if (now < decision.voteStart || now > decision.voteEnd) {
			throw new BadRequestException('Decision is not active')
		}

		const questionIds = decision.questions.map((q) => q._id.toString())
		const answeredIds = answers.map((a) => a.questionId)

		const allAnswered = questionIds.every((id) => answeredIds.includes(id))

		if (!allAnswered) {
			throw new BadRequestException('All questions must be answered')
		}

		for (const { questionId, value, memberId } of answers) {
			const question = decision.questions.find((q) => q._id.toString() === questionId)

			if (!question) {
				throw new NotFoundException(`Question ${questionId} not found`)
			}

			const alreadyAnswered = question.answers?.some((a) => a.memberId.toString() === memberId)

			if (alreadyAnswered) {
				throw new BadRequestException(`Member already answered question ${questionId}`)
			}

			if (
				question.type === DecisionQuestionType.RADIO ||
				question.type === DecisionQuestionType.SELECT
			) {
				const optionExists = question.options?.some((opt) => opt.value === value)

				if (!optionExists) {
					throw new BadRequestException(`Invalid option for question ${questionId}`)
				}
			}

			if (question.type === DecisionQuestionType.TEXT) {
				if (!value || value.trim().length === 0) {
					throw new BadRequestException(`Text answer required for question ${questionId}`)
				}
			}

			question.answers = question.answers || []

			question.answers.push({
				memberId: new Types.ObjectId(memberId),
				value
			})
		}

		await decision.save()

		return decision
	}

	async updateStatus(id: string, status: ApprovalStatusEnum) {
		const decision = await this.decisionModel.findById(id)
		if (!decision) throw new NotFoundException('Decision not found')

		decision.status = status
		await decision.save()

		return decision
	}

	// For image upload
	async generateImageUploadLink() {
		return this.awsService.generateUploadLink('DECISIONS')
	}

	async deleteFiles(fileUrls: string[]) {
		return this.awsService.deleteImages(fileUrls)
	}

	async generateResultsPdf(id: string, lang: ResultsPdfLang = 'ro') {
		const decision = await this.decisionModel
			.findById(id)
			.populate('questions.answers.memberId', '_id name email')

		if (!decision) throw new NotFoundException('Decision not found')

		return buildDecisionResultsPdf(decision, lang)
	}

	// Helper to validate questions
	private validateQuestions(questions: DecisionQuestionDto[]) {
		for (const question of questions) {
			if (
				question.type === DecisionQuestionType.SELECT ||
				question.type === DecisionQuestionType.RADIO
			) {
				if (!question.options || question.options.length === 0) {
					throw new BadRequestException(`Options are required for question type ${question.type}`)
				}
			}

			if (question.type === DecisionQuestionType.TEXT) {
				if (question.options && question.options.length > 0) {
					throw new BadRequestException('Text question should not contain options')
				}
			}
		}
	}
}
