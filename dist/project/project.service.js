"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const aws_service_1 = require("../aws/aws.service");
const project_schema_1 = require("../schemas/project.schema");
const sorting_enum_1 = require("../enums/sorting.enum");
let ProjectService = class ProjectService {
    projectModel;
    awsService;
    constructor(projectModel, awsService) {
        this.projectModel = projectModel;
        this.awsService = awsService;
    }
    async getAll(dto) {
        const { page, limit, sort, sortDirection = sorting_enum_1.SortDirection.DESC } = dto;
        let query = this.projectModel.find().populate('questions.answers.memberId', '_id name email');
        if (sort) {
            const sortOrder = sortDirection === sorting_enum_1.SortDirection.ASC ? 1 : -1;
            query = query.sort({ [sort]: sortOrder });
        }
        if (page && limit) {
            const skip = (page - 1) * limit;
            query = query.skip(skip).limit(limit);
        }
        const projects = await query.exec();
        const projectsWithAverage = projects.map((project) => {
            const projObj = project.toObject ? project.toObject() : project;
            return {
                ...projObj,
                averageMark: this.calculateAverageMark(project)
            };
        });
        return projectsWithAverage;
    }
    async getById(id) {
        const project = await this.projectModel
            .findById(id)
            .populate('questions.answers.memberId', '_id name email')
            .exec();
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const projObj = project.toObject ? project.toObject() : project;
        return {
            ...projObj,
            averageMark: this.calculateAverageMark(project)
        };
    }
    async create(dto) {
        const project = (await this.projectModel.create(dto)).toObject();
        return project;
    }
    async addAnswers(dto) {
        const { projectId, answers } = dto;
        const project = await this.projectModel.findById(projectId);
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const now = new Date();
        if (now < project.voteStart || now > project.voteEnd) {
            throw new common_1.BadRequestException('Project is not active');
        }
        const questionIds = project.questions.map((q) => q._id.toString());
        const answeredIds = answers.map((a) => a.questionId);
        const allAnswered = questionIds.every((id) => answeredIds.includes(id));
        if (!allAnswered) {
            throw new common_1.BadRequestException('You must answer all questions to submit.');
        }
        for (const { questionId, answer, memberId } of answers) {
            const question = project.questions.find((q) => q._id.toString() === questionId);
            if (!question)
                throw new common_1.NotFoundException(`Question ${questionId} not found`);
            const existingAnswerIndex = question.answers?.findIndex((a) => a.memberId.toString() === memberId);
            if (existingAnswerIndex !== undefined && existingAnswerIndex !== -1) {
                throw new common_1.BadRequestException(`Member has already answered question ${questionId}`);
            }
            question.answers = question.answers || [];
            question.answers.push({
                memberId: new mongoose_2.Types.ObjectId(memberId),
                answer
            });
        }
        await project.save();
        return project;
    }
    async update(id, dto) {
        if (!dto || Object.keys(dto).length === 0)
            throw new common_1.BadRequestException('No data provided');
        let data = dto;
        const project = await this.projectModel.findById(id);
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return this.projectModel.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        const project = await this.projectModel.findByIdAndDelete(id).exec();
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project;
    }
    async generateFileUploadLink() {
        return this.awsService.generatePdfUploadLink('PROJECTS');
    }
    async deleteDocuments(fileUrls) {
        return this.awsService.deleteImages(fileUrls);
    }
    calculateAverageMark(project) {
        let total = 0;
        let count = 0;
        for (const question of project.questions) {
            for (const answer of question.answers || []) {
                total += answer.answer;
                count++;
            }
        }
        return count === 0 ? 0 : total / count;
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        aws_service_1.AwsService])
], ProjectService);
//# sourceMappingURL=project.service.js.map