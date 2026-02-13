import { Model, Types } from 'mongoose';
import { AwsService } from 'src/aws/aws.service';
import { Project, ProjectDocument } from 'src/schemas/project.schema';
import { GetProjectsDto } from './dto/get-projects.dto';
import { ProjectDto } from './dto/project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddAnswersDto } from './dto/add-answers.dto';
export declare class ProjectService {
    private projectModel;
    private readonly awsService;
    constructor(projectModel: Model<ProjectDocument>, awsService: AwsService);
    getAll(dto: GetProjectsDto): Promise<{
        averageMark: number;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        title: import("../schemas/shared/text.schema").MultiLangText;
        description: import("../schemas/shared/text.schema").MultiLangText;
        pdfUrl: string;
        questions: import("src/schemas/project.schema").ProjectQuestion[];
        voteStart: Date;
        voteEnd: Date;
        __v: number;
    }[]>;
    getById(id: string): Promise<{
        averageMark: number;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        title: import("../schemas/shared/text.schema").MultiLangText;
        description: import("../schemas/shared/text.schema").MultiLangText;
        pdfUrl: string;
        questions: import("src/schemas/project.schema").ProjectQuestion[];
        voteStart: Date;
        voteEnd: Date;
        __v: number;
    }>;
    create(dto: ProjectDto): Promise<import("mongoose").Document<unknown, {}, Project, {}> & Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    addAnswers(dto: AddAnswersDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Project, {}> & Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, Project, {}> & Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateProjectDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Project, {}> & Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, Project, {}> & Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>) | null>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Project, {}> & Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, Project, {}> & Project & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    generateFileUploadLink(): Promise<{
        success: boolean;
        uploadUrl: string;
        publicUrl: string;
        key: string;
    }>;
    deleteDocuments(fileUrls: string[]): Promise<{
        success: boolean;
    }>;
    calculateAverageMark(project: ProjectDocument): number;
}
