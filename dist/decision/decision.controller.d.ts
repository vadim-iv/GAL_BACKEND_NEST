import { DecisionService } from './decision.service';
import { GetDecisionsDto } from './dto/get-decisions.dto';
import { DecisionDto } from './dto/decision.dto';
import { AddDecisionAnswersDto } from './dto/add-answers.dto';
import { UpdateDecisionDto } from './dto/update-decision-dto';
export declare class DecisionController {
    private readonly decisionService;
    constructor(decisionService: DecisionService);
    getAll(getDecisionsDto: GetDecisionsDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("../schemas/decision.schema").Decision, {}> & import("../schemas/decision.schema").Decision & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
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
}
