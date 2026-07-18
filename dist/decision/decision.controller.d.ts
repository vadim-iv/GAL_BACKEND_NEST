import { StreamableFile } from '@nestjs/common';
import { DecisionService } from './decision.service';
import { GetDecisionsDto } from './dto/get-decisions.dto';
import { DecisionDto } from './dto/decision.dto';
import { AddDecisionAnswersDto } from './dto/add-answers.dto';
import { UpdateDecisionDto } from './dto/update-decision-dto';
import { DeleteImagesDto } from 'src/blogs/dto/delete-images.dto';
import { ResultsPdfLang } from 'src/common/pdf/results-pdf.builder';
export declare class DecisionController {
    private readonly decisionService;
    constructor(decisionService: DecisionService);
    getAll(getDecisionsDto: GetDecisionsDto): Promise<{
        decisions: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}> & import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    getById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    create(dto: DecisionDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    addAnswers(dto: AddDecisionAnswersDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateDecisionDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    generateImageUploadLink(): Promise<{
        success: boolean;
        uploadUrl: string;
        publicUrl: string;
        key: string;
    }>;
    deleteFiles(dto: DeleteImagesDto): Promise<{
        success: boolean;
    }>;
    generateResultsPdf(id: string, lang?: ResultsPdfLang): Promise<StreamableFile>;
}
