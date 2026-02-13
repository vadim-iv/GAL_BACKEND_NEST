import { Model, Types } from 'mongoose';
import { Decision, DecisionDocument } from 'src/schemas/decision.schema';
import { GetDecisionsDto } from './dto/get-decisions.dto';
import { DecisionDto } from './dto/decision.dto';
import { UpdateDecisionDto } from './dto/update-decision-dto';
import { AddDecisionAnswersDto } from './dto/add-answers.dto';
export declare class DecisionService {
    private decisionModel;
    constructor(decisionModel: Model<DecisionDocument>);
    getAll(dto: GetDecisionsDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, Decision, {}> & Decision & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
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
    private validateQuestions;
}
