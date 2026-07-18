import { Model, Types } from 'mongoose';
import { Decision, DecisionDocument } from 'src/schemas/decision.schema';
import { GetDecisionsDto } from './dto/get-decisions.dto';
import { DecisionDto } from './dto/decision.dto';
import { UpdateDecisionDto } from './dto/update-decision-dto';
import { AddDecisionAnswersDto } from './dto/add-answers.dto';
import { AwsService } from 'src/aws/aws.service';
import { ResultsPdfLang } from 'src/common/pdf/results-pdf.builder';
import { TMember } from 'src/schemas/member.schema';
export declare class DecisionService {
    private decisionModel;
    private memberModel;
    private readonly awsService;
    constructor(decisionModel: Model<DecisionDocument>, memberModel: Model<TMember>, awsService: AwsService);
    getAll(dto: GetDecisionsDto): Promise<{
        decisions: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}> & import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>)[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    create(dto: DecisionDto): Promise<import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateDecisionDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>) | null>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    addAnswers(dto: AddDecisionAnswersDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    generateImageUploadLink(): Promise<{
        success: boolean;
        uploadUrl: string;
        publicUrl: string;
        key: string;
    }>;
    deleteFiles(fileUrls: string[]): Promise<{
        success: boolean;
    }>;
    generateResultsPdf(id: string, lang?: ResultsPdfLang): Promise<Buffer<ArrayBufferLike>>;
    private validateQuestions;
}
