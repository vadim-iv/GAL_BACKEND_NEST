import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { AwsService } from 'src/aws/aws.service'
import { Project, ProjectDocument } from 'src/schemas/project.schema'
import { GetProjectsDto } from './dto/get-projects.dto'
import { SortDirection } from 'src/enums/sorting.enum'
import { ProjectDto } from './dto/project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { AddAnswersDto } from './dto/add-answers.dto'

@Injectable()
export class ProjectService {
	constructor(
		@InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
		private readonly awsService: AwsService
	) {}

	async getAll(dto: GetProjectsDto) {
		const { page, limit, sort, sortDirection = SortDirection.DESC } = dto

		let query = this.projectModel.find().populate('questions.answers.memberId', '_id name email')

		if (sort) {
			const sortOrder = sortDirection === SortDirection.ASC ? 1 : -1
			query = query.sort({ [sort]: sortOrder })
		}

		if (page && limit) {
			const skip = (page - 1) * limit
			query = query.skip(skip).limit(limit)
		}

		const projects = await query.exec()

		const projectsWithAverage = projects.map((project) => {
			const projObj = project.toObject ? project.toObject() : project
			return {
				...projObj,
				averageMark: this.calculateAverageMark(project)
			}
		})

		return projectsWithAverage
	}

	async getById(id: string) {
		const project = await this.projectModel
			.findById(id)
			.populate('questions.answers.memberId', '_id name email')
			.exec()
		if (!project) throw new NotFoundException('Project not found')
		const projObj = project.toObject ? project.toObject() : project
		return {
			...projObj,
			averageMark: this.calculateAverageMark(project)
		}
	}

	async create(dto: ProjectDto) {
		const project = (await this.projectModel.create(dto)).toObject()

		return project
	}

	async addAnswers(dto: AddAnswersDto) {
		const { projectId, answers } = dto
		const project = await this.projectModel.findById(projectId)
		if (!project) throw new NotFoundException('Project not found')

		const now = new Date()
		if (now < project.voteStart || now > project.voteEnd) {
			throw new BadRequestException('Project is not active')
		}

		const questionIds = project.questions.map((q) => q._id.toString())
		const answeredIds = answers.map((a) => a.questionId)

		const allAnswered = questionIds.every((id) => answeredIds.includes(id))
		if (!allAnswered) {
			throw new BadRequestException('You must answer all questions to submit.')
		}

		for (const { questionId, answer, memberId } of answers) {
			const question = project.questions.find((q) => q._id.toString() === questionId)
			if (!question) throw new NotFoundException(`Question ${questionId} not found`)

			const existingAnswerIndex = question.answers?.findIndex(
				(a) => a.memberId.toString() === memberId
			)
			if (existingAnswerIndex !== undefined && existingAnswerIndex !== -1) {
				throw new BadRequestException(`Member has already answered question ${questionId}`)
			}

			question.answers = question.answers || []
			question.answers.push({
				memberId: new Types.ObjectId(memberId),
				answer
			})
		}

		await project.save()
		return project
	}

	async update(id: string, dto: UpdateProjectDto) {
		if (!dto || Object.keys(dto).length === 0) throw new BadRequestException('No data provided')
		let data = dto

		const project = await this.projectModel.findById(id)
		if (!project) throw new NotFoundException('Project not found')

		return this.projectModel.findByIdAndUpdate(id, data, { new: true })
	}

	async delete(id: string) {
		const project = await this.projectModel.findByIdAndDelete(id).exec()
		if (!project) throw new NotFoundException('Project not found')
		return project
	}

	// For PDF upload
	async generateFileUploadLink() {
		return this.awsService.generatePdfUploadLink('PROJECTS')
	}

	async deleteDocuments(fileUrls: string[]) {
		return this.awsService.deleteImages(fileUrls)
	}

	// Helper method to calculate the average answer for a question
	calculateAverageMark(project: ProjectDocument): number {
		let total = 0
		let count = 0

		for (const question of project.questions) {
			for (const answer of question.answers || []) {
				total += answer.answer
				count++
			}
		}

		return count === 0 ? 0 : total / count
	}
}
