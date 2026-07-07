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
exports.LocalCallService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const local_call_schema_1 = require("../schemas/local_call.schema");
const sorting_enum_1 = require("../enums/sorting.enum");
const status_enum_1 = require("../enums/status.enum");
const aws_service_1 = require("../aws/aws.service");
const results_pdf_builder_1 = require("../common/pdf/results-pdf.builder");
let LocalCallService = class LocalCallService {
    localCallModel;
    awsService;
    constructor(localCallModel, awsService) {
        this.localCallModel = localCallModel;
        this.awsService = awsService;
    }
    async getAll(dto) {
        const { page, limit, sort, sortDirection = sorting_enum_1.SortDirection.DESC } = dto;
        let query = this.localCallModel.find().populate('projects.answers.memberId', '_id name email');
        if (sort) {
            const sortOrder = sortDirection === sorting_enum_1.SortDirection.ASC ? 1 : -1;
            query = query.sort({ [sort]: sortOrder });
        }
        if (page && limit) {
            const skip = (page - 1) * limit;
            query = query.skip(skip).limit(limit);
        }
        const localCalls = await query.exec();
        return localCalls.map((localCall) => this.toResponseObject(localCall));
    }
    async getById(id) {
        const localCall = await this.localCallModel
            .findById(id)
            .populate('projects.answers.memberId', '_id name email');
        if (!localCall)
            throw new common_1.NotFoundException('Local call not found');
        return this.toResponseObject(localCall);
    }
    async create(dto) {
        const questions = dto.questions.map((q) => ({ ...q, maxScore: q.maxScore ?? 10 }));
        const localCall = await this.localCallModel.create({ ...dto, questions });
        return localCall.toObject();
    }
    async update(id, dto) {
        if (!dto || Object.keys(dto).length === 0)
            throw new common_1.BadRequestException('No data provided');
        const localCall = await this.localCallModel.findById(id);
        if (!localCall)
            throw new common_1.NotFoundException('Local call not found');
        let data = dto;
        if (dto.questions) {
            data = { ...dto, questions: dto.questions.map((q) => ({ ...q, maxScore: q.maxScore ?? 10 })) };
        }
        return this.localCallModel.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        const localCall = await this.localCallModel.findByIdAndDelete(id).exec();
        if (!localCall)
            throw new common_1.NotFoundException('Local call not found');
        return localCall;
    }
    async addProject(localCallId, dto) {
        const localCall = await this.localCallModel.findById(localCallId);
        if (!localCall)
            throw new common_1.NotFoundException('Local call not found');
        localCall.projects.push({
            ...dto,
            status: status_enum_1.ApprovalStatusEnum.PENDING,
            answers: []
        });
        await localCall.save();
        return localCall.toObject();
    }
    async updateProject(localCallId, projectId, dto) {
        if (!dto || Object.keys(dto).length === 0)
            throw new common_1.BadRequestException('No data provided');
        const localCall = await this.localCallModel.findById(localCallId);
        if (!localCall)
            throw new common_1.NotFoundException('Local call not found');
        const project = localCall.projects.find((p) => p._id.toString() === projectId);
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        Object.assign(project, dto);
        await localCall.save();
        return localCall.toObject();
    }
    async deleteProject(localCallId, projectId) {
        const localCall = await this.localCallModel.findById(localCallId);
        if (!localCall)
            throw new common_1.NotFoundException('Local call not found');
        const projectIndex = localCall.projects.findIndex((p) => p._id.toString() === projectId);
        if (projectIndex === -1)
            throw new common_1.NotFoundException('Project not found');
        localCall.projects.splice(projectIndex, 1);
        await localCall.save();
        return localCall.toObject();
    }
    async updateProjectStatus(localCallId, projectId, status) {
        const localCall = await this.localCallModel.findById(localCallId);
        if (!localCall)
            throw new common_1.NotFoundException('Local call not found');
        const project = localCall.projects.find((p) => p._id.toString() === projectId);
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        project.status = status;
        await localCall.save();
        return localCall.toObject();
    }
    async addAnswers(dto) {
        const { localCallId, projectId, answers } = dto;
        const localCall = await this.localCallModel.findById(localCallId);
        if (!localCall)
            throw new common_1.NotFoundException('Local call not found');
        const now = new Date();
        if (now < localCall.voteStart || now > localCall.voteEnd) {
            throw new common_1.BadRequestException('Local call is not active');
        }
        const project = localCall.projects.find((p) => p._id.toString() === projectId);
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const questionIds = localCall.questions.map((q) => q._id.toString());
        const answeredIds = answers.map((a) => a.questionId);
        for (const answeredId of answeredIds) {
            if (!questionIds.includes(answeredId)) {
                throw new common_1.BadRequestException(`Question ${answeredId} does not belong to this local call`);
            }
        }
        const allAnswered = questionIds.every((id) => answeredIds.includes(id));
        if (!allAnswered) {
            throw new common_1.BadRequestException('You must answer all questions to submit.');
        }
        for (const { questionId, answer, memberId } of answers) {
            const question = localCall.questions.find((q) => q._id.toString() === questionId);
            if (!question)
                throw new common_1.NotFoundException(`Question ${questionId} not found`);
            if (answer < 0 || answer > question.maxScore) {
                throw new common_1.BadRequestException(`Answer for question ${questionId} must be between 0 and ${question.maxScore}`);
            }
            const alreadyAnswered = project.answers?.some((a) => a.questionId.toString() === questionId && a.memberId.toString() === memberId);
            if (alreadyAnswered) {
                throw new common_1.BadRequestException(`Member has already answered question ${questionId}`);
            }
            project.answers.push({
                questionId: new mongoose_2.Types.ObjectId(questionId),
                memberId: new mongoose_2.Types.ObjectId(memberId),
                answer
            });
        }
        await localCall.save();
        return localCall.toObject();
    }
    async generateFileUploadLink() {
        return this.awsService.generatePdfUploadLink('PROJECTS');
    }
    async generateImageUploadLink() {
        return this.awsService.generateUploadLink('LOCAL_CALLS');
    }
    async deleteDocuments(fileUrls) {
        return this.awsService.deleteImages(fileUrls);
    }
    async generateResultsPdf(id, lang = 'ro') {
        const localCall = await this.localCallModel
            .findById(id)
            .populate('projects.answers.memberId', '_id name email');
        if (!localCall)
            throw new common_1.NotFoundException('Local call not found');
        return (0, results_pdf_builder_1.buildLocalCallResultsPdf)(localCall, lang);
    }
    toResponseObject(localCall) {
        const obj = localCall.toObject();
        obj.projects = obj.projects.map((project) => ({
            ...project,
            averageMark: this.calculateAverageMark(obj.questions, project)
        }));
        return obj;
    }
    calculateAverageMark(questions, project) {
        if (!project.answers || project.answers.length === 0)
            return 0;
        const normalized = project.answers.map((a) => {
            const question = questions.find((q) => q._id.toString() === a.questionId.toString());
            const maxScore = question?.maxScore || 10;
            return (a.answer / maxScore) * 10;
        });
        const sum = normalized.reduce((acc, val) => acc + val, 0);
        return sum / normalized.length;
    }
};
exports.LocalCallService = LocalCallService;
exports.LocalCallService = LocalCallService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(local_call_schema_1.LocalCall.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        aws_service_1.AwsService])
], LocalCallService);
//# sourceMappingURL=local-call.service.js.map