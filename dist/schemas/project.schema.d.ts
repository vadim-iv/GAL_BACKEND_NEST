import { HydratedDocument, Types } from 'mongoose';
import { MultiLangText } from './shared/text.schema';
export type ProjectDocument = HydratedDocument<Project>;
export declare class ProjectAnswer {
    memberId: Types.ObjectId;
    answer: number;
}
export declare class ProjectQuestion {
    _id: Types.ObjectId;
    question: MultiLangText;
    answers: ProjectAnswer[];
}
export declare class Project {
    title: MultiLangText;
    description: MultiLangText;
    pdfUrl: string;
    questions: ProjectQuestion[];
    voteStart: Date;
    voteEnd: Date;
}
export declare const ProjectSchema: import("mongoose").Schema<Project, import("mongoose").Model<Project, any, any, any, import("mongoose").Document<unknown, any, Project, any> & Project & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Project, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Project>, {}> & import("mongoose").FlatRecord<Project> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
