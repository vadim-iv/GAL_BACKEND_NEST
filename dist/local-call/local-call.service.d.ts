import { Model, Types } from 'mongoose';
import { LocalCall, LocalCallDocument } from 'src/schemas/local_call.schema';
import { GetLocalCallsDto } from './dto/get-local-calls.dto';
import { GetProjectsDto } from './dto/get-projects.dto';
import { LocalCallDto } from './dto/local-call.dto';
import { UpdateLocalCallDto } from './dto/update-local-call.dto';
import { ProjectDto } from './dto/project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddLocalCallAnswersDto } from './dto/add-answers.dto';
import { ApprovalStatusEnum } from 'src/enums/status.enum';
import { AwsService } from 'src/aws/aws.service';
import { ResultsPdfLang } from 'src/common/pdf/results-pdf.builder';
import { TMember } from 'src/schemas/member.schema';
export declare class LocalCallService {
    private localCallModel;
    private memberModel;
    private readonly awsService;
    constructor(localCallModel: Model<LocalCallDocument>, memberModel: Model<TMember>, awsService: AwsService);
    getAll(dto: GetLocalCallsDto): Promise<{
        localCalls: (LocalCall & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getById(id: string): Promise<LocalCall & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    getProjects(localCallId: string, dto: GetProjectsDto): Promise<{
        projects: {
            averageMark: number;
            _id: Types.ObjectId;
            title: import("../schemas/shared/text.schema").MultiLangText;
            description: import("../schemas/shared/text.schema").MultiLangText;
            pdfUrl: string;
            imageUrl?: string;
            status: ApprovalStatusEnum;
            answers: import("src/schemas/local_call.schema").ProjectAnswer[];
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    create(dto: LocalCallDto): Promise<import("mongoose").Document<unknown, {}, LocalCall, {}> & LocalCall & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateLocalCallDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LocalCall, {}> & LocalCall & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, LocalCall, {}> & LocalCall & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>) | null>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, LocalCall, {}> & LocalCall & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, LocalCall, {}> & LocalCall & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    addProject(localCallId: string, dto: ProjectDto): Promise<import("mongoose").Document<unknown, {}, LocalCall, {}> & LocalCall & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    updateProject(localCallId: string, projectId: string, dto: UpdateProjectDto): Promise<import("mongoose").Document<unknown, {}, LocalCall, {}> & LocalCall & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteProject(localCallId: string, projectId: string): Promise<import("mongoose").Document<unknown, {}, LocalCall, {}> & LocalCall & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    addAnswers(dto: AddLocalCallAnswersDto): Promise<import("mongoose").Document<unknown, {}, LocalCall, {}> & LocalCall & {
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
    generateImageUploadLink(): Promise<{
        success: boolean;
        uploadUrl: string;
        publicUrl: string;
        key: string;
    }>;
    deleteDocuments(fileUrls: string[]): Promise<{
        success: boolean;
    }>;
    generateProjectResultsPdf(id: string, projectId: string, lang?: ResultsPdfLang): Promise<Buffer<ArrayBufferLike>>;
    private toResponseObject;
    private calculateAverageMark;
}
