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
exports.DecisionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const decision_schema_1 = require("../schemas/decision.schema");
const sorting_enum_1 = require("../enums/sorting.enum");
const decision_enum_1 = require("../enums/decision.enum");
const aws_service_1 = require("../aws/aws.service");
const results_pdf_builder_1 = require("../common/pdf/results-pdf.builder");
const member_schema_1 = require("../schemas/member.schema");
let DecisionService = class DecisionService {
    decisionModel;
    memberModel;
    awsService;
    constructor(decisionModel, memberModel, awsService) {
        this.decisionModel = decisionModel;
        this.memberModel = memberModel;
        this.awsService = awsService;
    }
    async getAll(dto) {
        const { page = 1, limit = 12, sort, sortDirection = sorting_enum_1.SortDirection.DESC } = dto;
        const skip = (page - 1) * limit;
        let query = this.decisionModel.find().populate('questions.answers.memberId', '_id name email');
        if (sort) {
            const sortOrder = sortDirection === sorting_enum_1.SortDirection.ASC ? 1 : -1;
            query = query.sort({ [sort]: sortOrder });
        }
        query = query.skip(skip).limit(limit);
        const [decisions, total] = await Promise.all([query.exec(), this.decisionModel.countDocuments().exec()]);
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
        };
    }
    async getById(id) {
        const decision = await this.decisionModel
            .findById(id)
            .populate('questions.answers.memberId', '_id name email');
        if (!decision)
            throw new common_1.NotFoundException('Decision not found');
        return decision;
    }
    async create(dto) {
        this.validateQuestions(dto.questions);
        const decision = (await this.decisionModel.create(dto)).toObject();
        return decision;
    }
    async update(id, dto) {
        if (!dto || Object.keys(dto).length === 0)
            throw new common_1.BadRequestException('No data provided');
        let data = dto;
        if (dto.questions) {
            this.validateQuestions(dto.questions);
        }
        const decision = await this.decisionModel.findById(id);
        if (!decision)
            throw new common_1.NotFoundException('Decision not found');
        if (dto.questions) {
            const existingAnswersById = new Map(decision.questions.map((question) => [question._id.toString(), question.answers]));
            data = {
                ...dto,
                questions: dto.questions.map((question) => ({
                    ...question,
                    answers: (question._id && existingAnswersById.get(question._id)) || []
                }))
            };
        }
        return this.decisionModel.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        const decision = await this.decisionModel.findByIdAndDelete(id).exec();
        if (!decision)
            throw new common_1.NotFoundException('Decision not found');
        return decision;
    }
    async addAnswers(dto) {
        const { decisionId, answers } = dto;
        const decision = await this.decisionModel.findById(decisionId);
        if (!decision)
            throw new common_1.NotFoundException('Decision not found');
        const now = new Date();
        if (now < decision.voteStart || now > decision.voteEnd) {
            throw new common_1.BadRequestException('Decision is not active');
        }
        const questionIds = decision.questions.map((q) => q._id.toString());
        const answeredIds = answers.map((a) => a.questionId);
        const allAnswered = questionIds.every((id) => answeredIds.includes(id));
        if (!allAnswered) {
            throw new common_1.BadRequestException('All questions must be answered');
        }
        const memberIds = [...new Set(answers.map((a) => a.memberId))];
        const existingMembers = await this.memberModel.find({ _id: { $in: memberIds } }).select('_id').exec();
        const existingMemberIds = new Set(existingMembers.map((m) => m._id.toString()));
        for (const memberId of memberIds) {
            if (!existingMemberIds.has(memberId)) {
                throw new common_1.NotFoundException(`Member ${memberId} not found`);
            }
        }
        for (const { questionId, value, values, memberId } of answers) {
            const question = decision.questions.find((q) => q._id.toString() === questionId);
            if (!question) {
                throw new common_1.NotFoundException(`Question ${questionId} not found`);
            }
            const alreadyAnswered = question.answers?.some((a) => a.memberId.toString() === memberId);
            if (alreadyAnswered) {
                throw new common_1.BadRequestException(`Member already answered question ${questionId}`);
            }
            if (question.type === decision_enum_1.DecisionQuestionType.RADIO) {
                const optionExists = question.options?.some((opt) => opt.value === value);
                if (!optionExists) {
                    throw new common_1.BadRequestException(`Invalid option for question ${questionId}`);
                }
            }
            if (question.type === decision_enum_1.DecisionQuestionType.CHECKBOX) {
                if (!values || values.length === 0) {
                    throw new common_1.BadRequestException(`At least one option is required for question ${questionId}`);
                }
                const allOptionsExist = values.every((v) => question.options?.some((opt) => opt.value === v));
                if (!allOptionsExist) {
                    throw new common_1.BadRequestException(`Invalid option for question ${questionId}`);
                }
            }
            if (question.type === decision_enum_1.DecisionQuestionType.TEXT) {
                if (!value || value.trim().length === 0) {
                    throw new common_1.BadRequestException(`Text answer required for question ${questionId}`);
                }
            }
            question.answers = question.answers || [];
            question.answers.push({
                memberId: new mongoose_2.Types.ObjectId(memberId),
                ...(question.type === decision_enum_1.DecisionQuestionType.CHECKBOX ? { values } : { value })
            });
        }
        await decision.save();
        return decision;
    }
    async generateImageUploadLink() {
        return this.awsService.generateUploadLink('DECISIONS');
    }
    async deleteFiles(fileUrls) {
        return this.awsService.deleteImages(fileUrls);
    }
    async generateResultsPdf(id, lang = 'ro') {
        const decision = await this.decisionModel
            .findById(id)
            .populate('questions.answers.memberId', '_id name email');
        if (!decision)
            throw new common_1.NotFoundException('Decision not found');
        return (0, results_pdf_builder_1.buildDecisionResultsPdf)(decision, lang);
    }
    validateQuestions(questions) {
        for (const question of questions) {
            if (question.type === decision_enum_1.DecisionQuestionType.CHECKBOX ||
                question.type === decision_enum_1.DecisionQuestionType.RADIO) {
                if (!question.options || question.options.length === 0) {
                    throw new common_1.BadRequestException(`Options are required for question type ${question.type}`);
                }
            }
            if (question.type === decision_enum_1.DecisionQuestionType.TEXT) {
                if (question.options && question.options.length > 0) {
                    throw new common_1.BadRequestException('Text question should not contain options');
                }
            }
        }
    }
};
exports.DecisionService = DecisionService;
exports.DecisionService = DecisionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(decision_schema_1.Decision.name)),
    __param(1, (0, mongoose_1.InjectModel)(member_schema_1.Member.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        aws_service_1.AwsService])
], DecisionService);
//# sourceMappingURL=decision.service.js.map