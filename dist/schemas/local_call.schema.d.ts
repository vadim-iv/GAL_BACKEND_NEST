import { HydratedDocument, Types } from 'mongoose';
import { MultiLangText } from './shared/text.schema';
import { ApprovalStatusEnum } from 'src/enums/status.enum';
export type LocalCallDocument = HydratedDocument<LocalCall>;
export declare class ProjectAnswer {
    questionId: Types.ObjectId;
    memberId: Types.ObjectId;
    answer: number;
}
export declare class Project {
    _id: Types.ObjectId;
    title: MultiLangText;
    description: MultiLangText;
    pdfUrl: string;
    imageUrl?: string;
    status: ApprovalStatusEnum;
    answers: ProjectAnswer[];
}
export declare class LocalCallQuestion {
    _id: Types.ObjectId;
    question: MultiLangText;
    maxScore: number;
}
export declare class LocalCall {
    name: MultiLangText;
    description: MultiLangText;
    imageUrl?: string;
    questions: LocalCallQuestion[];
    projects: Project[];
    voteStart: Date;
    voteEnd: Date;
}
export declare const LocalCallSchema: import("mongoose").Schema<LocalCall, import("mongoose").Model<LocalCall, any, any, any, import("mongoose").Document<unknown, any, LocalCall, any> & LocalCall & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LocalCall, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<LocalCall>, {}> & import("mongoose").FlatRecord<LocalCall> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
