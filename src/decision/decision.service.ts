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
import { AwsService } from 'src/aws/aws.service'
import { buildDecisionResultsPdf, ResultsPdfLang } from 'src/common/pdf/results-pdf.builder'
import { Member, TMember } from 'src/schemas/member.schema'

@Injectable()
export class DecisionService {
	constructor(
		@InjectModel(Decision.name)
		private decisionModel: Model<DecisionDocument>,
		@InjectModel(Member.name) private memberModel: Model<TMember>,
		private readonly awsService: AwsService
	) {}

	async getAll(dto: GetDecisionsDto) {
		const { page = 1, limit = 12, sort, sortDirection = SortDirection.DESC } = dto

		const skip = (page - 1) * limit
		let query = this.decisionModel.find().populate('questions.answers.memberId', '_id name email')

		if (sort) {
			const sortOrder = sortDirection === SortDirection.ASC ? 1 : -1
			query = query.sort({ [sort]: sortOrder })
		}

		query = query.skip(skip).limit(limit)

		const [decisions, total] = await Promise.all([query.exec(), this.decisionModel.countDocuments().exec()])

		return {
			decisions,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
				hasNextPage: page < Math.ceil(total / limit),
				hasPrevPage: page > 1
			}
		}
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

		// dto.questions is a full replacement array and the DTO doesn't carry
		// each question's `answers` (the edit form never submits votes back) —
		// findByIdAndUpdate would otherwise overwrite every question subdocument
		// and fall back to the schema's `answers: []` default, silently
		// wiping all existing votes. Re-attach each matched question's answers
		// by _id before saving; a question with no matching _id is new and has
		// no votes yet.
		if (dto.questions) {
			const existingAnswersById = new Map(
				decision.questions.map((question) => [question._id.toString(), question.answers])
			)

			data = {
				...dto,
				questions: dto.questions.map((question) => ({
					...question,
					answers: (question._id && existingAnswersById.get(question._id)) || []
				}))
			} as unknown as UpdateDecisionDto
		}

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

		const memberIds = [...new Set(answers.map((a) => a.memberId))]
		const existingMembers = await this.memberModel.find({ _id: { $in: memberIds } }).select('_id').exec()
		const existingMemberIds = new Set(existingMembers.map((m) => m._id.toString()))

		for (const memberId of memberIds) {
			if (!existingMemberIds.has(memberId)) {
				throw new NotFoundException(`Member ${memberId} not found`)
			}
		}

		for (const { questionId, value, values, memberId } of answers) {
			const question = decision.questions.find((q) => q._id.toString() === questionId)

			if (!question) {
				throw new NotFoundException(`Question ${questionId} not found`)
			}

			const alreadyAnswered = question.answers?.some((a) => a.memberId.toString() === memberId)

			if (alreadyAnswered) {
				throw new BadRequestException(`Member already answered question ${questionId}`)
			}

			if (question.type === DecisionQuestionType.RADIO) {
				const optionExists = question.options?.some((opt) => opt.value === value)

				if (!optionExists) {
					throw new BadRequestException(`Invalid option for question ${questionId}`)
				}
			}

			if (question.type === DecisionQuestionType.CHECKBOX) {
				if (!values || values.length === 0) {
					throw new BadRequestException(`At least one option is required for question ${questionId}`)
				}

				const allOptionsExist = values.every((v) => question.options?.some((opt) => opt.value === v))

				if (!allOptionsExist) {
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
				...(question.type === DecisionQuestionType.CHECKBOX ? { values } : { value })
			})
		}

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
				question.type === DecisionQuestionType.CHECKBOX ||
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
