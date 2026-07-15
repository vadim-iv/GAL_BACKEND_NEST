import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { LocalCall, LocalCallDocument, LocalCallQuestion, Project } from 'src/schemas/local_call.schema'
import { GetLocalCallsDto } from './dto/get-local-calls.dto'
import { GetProjectsDto } from './dto/get-projects.dto'
import { SortDirection } from 'src/enums/sorting.enum'
import { LocalCallDto } from './dto/local-call.dto'
import { UpdateLocalCallDto } from './dto/update-local-call.dto'
import { ProjectDto } from './dto/project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { AddLocalCallAnswersDto } from './dto/add-answers.dto'
import { ApprovalStatusEnum } from 'src/enums/status.enum'
import { AwsService } from 'src/aws/aws.service'
import { buildProjectResultsPdf, ResultsPdfLang } from 'src/common/pdf/results-pdf.builder'
import { Member, TMember } from 'src/schemas/member.schema'

@Injectable()
export class LocalCallService {
	constructor(
		@InjectModel(LocalCall.name) private localCallModel: Model<LocalCallDocument>,
		@InjectModel(Member.name) private memberModel: Model<TMember>,
		private readonly awsService: AwsService
	) {}

	async getAll(dto: GetLocalCallsDto) {
		const { page = 1, limit = 12, sort, sortDirection = SortDirection.DESC } = dto
		const skip = (page - 1) * limit

		let query = this.localCallModel.find().populate('projects.answers.memberId', '_id name email')

		if (sort) {
			const sortOrder = sortDirection === SortDirection.ASC ? 1 : -1
			query = query.sort({ [sort]: sortOrder })
		}

		query = query.skip(skip).limit(limit)

		const [localCalls, total] = await Promise.all([
			query.exec(),
			this.localCallModel.countDocuments().exec()
		])

		return {
			localCalls: localCalls.map((localCall) => this.toResponseObject(localCall)),
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
		const localCall = await this.localCallModel
			.findById(id)
			.populate('projects.answers.memberId', '_id name email')

		if (!localCall) throw new NotFoundException('Local call not found')

		return this.toResponseObject(localCall)
	}

	// List-oriented, paginated view of a single local call's embedded projects —
	// no populate (member/answer detail isn't needed for a projects list row).
	async getProjects(localCallId: string, dto: GetProjectsDto) {
		const { page = 1, limit = 12 } = dto
		const skip = (page - 1) * limit

		const [result] = await this.localCallModel
			.aggregate([
				{ $match: { _id: new Types.ObjectId(localCallId) } },
				{
					$project: {
						questions: 1,
						total: { $size: '$projects' },
						projects: { $slice: [{ $reverseArray: '$projects' }, skip, limit] }
					}
				}
			])
			.exec()

		if (!result) throw new NotFoundException('Local call not found')

		const total = result.total as number
		const projects = (result.projects as Project[]).map((project) => ({
			...project,
			averageMark: this.calculateAverageMark(result.questions, project)
		}))

		return {
			projects,
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

	async create(dto: LocalCallDto) {
		const questions = dto.questions.map((q) => ({ ...q, maxScore: q.maxScore ?? 10 }))

		const localCall = await this.localCallModel.create({ ...dto, questions })

		return localCall.toObject()
	}

	async update(id: string, dto: UpdateLocalCallDto) {
		if (!dto || Object.keys(dto).length === 0) throw new BadRequestException('No data provided')

		const localCall = await this.localCallModel.findById(id)
		if (!localCall) throw new NotFoundException('Local call not found')

		let data: UpdateLocalCallDto = dto
		if (dto.questions) {
			data = { ...dto, questions: dto.questions.map((q) => ({ ...q, maxScore: q.maxScore ?? 10 })) }
		}

		return this.localCallModel.findByIdAndUpdate(id, data, { new: true })
	}

	async delete(id: string) {
		const localCall = await this.localCallModel.findByIdAndDelete(id).exec()
		if (!localCall) throw new NotFoundException('Local call not found')
		return localCall
	}

	async addProject(localCallId: string, dto: ProjectDto) {
		const localCall = await this.localCallModel.findById(localCallId)
		if (!localCall) throw new NotFoundException('Local call not found')

		localCall.projects.push({
			...dto,
			status: ApprovalStatusEnum.PENDING,
			answers: []
		} as unknown as Project)

		await localCall.save()

		return localCall.toObject()
	}

	async updateProject(localCallId: string, projectId: string, dto: UpdateProjectDto) {
		if (!dto || Object.keys(dto).length === 0) throw new BadRequestException('No data provided')

		const localCall = await this.localCallModel.findById(localCallId)
		if (!localCall) throw new NotFoundException('Local call not found')

		const project = localCall.projects.find((p) => p._id.toString() === projectId)
		if (!project) throw new NotFoundException('Project not found')

		Object.assign(project, dto)

		await localCall.save()

		return localCall.toObject()
	}

	async deleteProject(localCallId: string, projectId: string) {
		const localCall = await this.localCallModel.findById(localCallId)
		if (!localCall) throw new NotFoundException('Local call not found')

		const projectIndex = localCall.projects.findIndex((p) => p._id.toString() === projectId)
		if (projectIndex === -1) throw new NotFoundException('Project not found')

		localCall.projects.splice(projectIndex, 1)

		await localCall.save()

		return localCall.toObject()
	}

	// Add a member's answers to a specific project's questions (inherited from the parent local call)
	async addAnswers(dto: AddLocalCallAnswersDto) {
		const { localCallId, projectId, answers } = dto

		const localCall = await this.localCallModel.findById(localCallId)
		if (!localCall) throw new NotFoundException('Local call not found')

		const now = new Date()
		if (now < localCall.voteStart || now > localCall.voteEnd) {
			throw new BadRequestException('Local call is not active')
		}

		const project = localCall.projects.find((p) => p._id.toString() === projectId)
		if (!project) throw new NotFoundException('Project not found')

		const questionIds = localCall.questions.map((q) => q._id.toString())
		const answeredIds = answers.map((a) => a.questionId)

		for (const answeredId of answeredIds) {
			if (!questionIds.includes(answeredId)) {
				throw new BadRequestException(`Question ${answeredId} does not belong to this local call`)
			}
		}

		const allAnswered = questionIds.every((id) => answeredIds.includes(id))
		if (!allAnswered) {
			throw new BadRequestException('You must answer all questions to submit.')
		}

		const memberIds = [...new Set(answers.map((a) => a.memberId))]
		const existingMembers = await this.memberModel.find({ _id: { $in: memberIds } }).select('_id').exec()
		const existingMemberIds = new Set(existingMembers.map((m) => m._id.toString()))

		for (const memberId of memberIds) {
			if (!existingMemberIds.has(memberId)) {
				throw new NotFoundException(`Member ${memberId} not found`)
			}
		}

		for (const { questionId, answer, memberId } of answers) {
			const question = localCall.questions.find((q) => q._id.toString() === questionId)
			if (!question) throw new NotFoundException(`Question ${questionId} not found`)

			if (answer < 0 || answer > question.maxScore) {
				throw new BadRequestException(
					`Answer for question ${questionId} must be between 0 and ${question.maxScore}`
				)
			}

			const alreadyAnswered = project.answers?.some(
				(a) => a.questionId.toString() === questionId && a.memberId.toString() === memberId
			)
			if (alreadyAnswered) {
				throw new BadRequestException(`Member has already answered question ${questionId}`)
			}

			project.answers.push({
				questionId: new Types.ObjectId(questionId),
				memberId: new Types.ObjectId(memberId),
				answer
			})
		}

		await localCall.save()

		return localCall.toObject()
	}

	// For PDF upload (project's own linked document)
	async generateFileUploadLink() {
		return this.awsService.generatePdfUploadLink('PROJECTS')
	}

	// For image upload (local_call or project imageUrl)
	async generateImageUploadLink() {
		return this.awsService.generateUploadLink('LOCAL_CALLS')
	}

	async deleteDocuments(fileUrls: string[]) {
		return this.awsService.deleteImages(fileUrls)
	}

	async generateProjectResultsPdf(id: string, projectId: string, lang: ResultsPdfLang = 'ro') {
		const localCall = await this.localCallModel
			.findById(id)
			.populate('projects.answers.memberId', '_id name email')

		if (!localCall) throw new NotFoundException('Local call not found')

		const project = localCall.projects.find((p) => p._id.toString() === projectId)
		if (!project) throw new NotFoundException('Project not found')

		return buildProjectResultsPdf(localCall, project, lang)
	}

	private toResponseObject(localCall: LocalCallDocument) {
		const obj = localCall.toObject()

		obj.projects = obj.projects.map((project) => ({
			...project,
			averageMark: this.calculateAverageMark(obj.questions, project)
		}))

		return obj
	}

	private calculateAverageMark(
		questions: Pick<LocalCallQuestion, '_id' | 'maxScore'>[],
		project: Pick<Project, 'answers'>
	): number {
		if (!project.answers || project.answers.length === 0) return 0

		const normalized = project.answers.map((a) => {
			const question = questions.find((q) => q._id.toString() === a.questionId.toString())
			const maxScore = question?.maxScore || 10
			return (a.answer / maxScore) * 10
		})

		const sum = normalized.reduce((acc, val) => acc + val, 0)

		return sum / normalized.length
	}
}
