import { HydratedDocument, Types } from 'mongoose';
import { MultiLangText } from './shared/text.schema';
import { DecisionQuestionType } from 'src/enums/decision.enum';
import { ApprovalStatusEnum } from 'src/enums/status.enum';
export type DecisionDocument = HydratedDocument<Decision>;
export declare class DecisionOption {
    value: string;
    label: MultiLangText;
}
export declare class DecisionAnswer {
    memberId: Types.ObjectId;
    value: string;
}
export declare class DecisionQuestion {
    _id: Types.ObjectId;
    question: MultiLangText;
    type: DecisionQuestionType;
    options?: DecisionOption[];
    answers: DecisionAnswer[];
}
export declare class Decision {
    title: MultiLangText;
    description: MultiLangText;
    imageUrl?: string;
    status: ApprovalStatusEnum;
    questions: DecisionQuestion[];
    voteStart: Date;
    voteEnd: Date;
}
export declare const DecisionSchema: import("mongoose").Schema<Decision, import("mongoose").Model<Decision, any, any, any, import("mongoose").Document<unknown, any, Decision, any> & Decision & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Decision, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Decision>, {}> & import("mongoose").FlatRecord<Decision> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
