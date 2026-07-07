import { StreamableFile } from '@nestjs/common';
import { LocalCallService } from './local-call.service';
import { GetLocalCallsDto } from './dto/get-local-calls.dto';
import { LocalCallDto } from './dto/local-call.dto';
import { UpdateLocalCallDto } from './dto/update-local-call.dto';
import { ProjectDto } from './dto/project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddLocalCallAnswersDto } from './dto/add-answers.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { DeleteImagesDto } from 'src/blogs/dto/delete-images.dto';
import { ResultsPdfLang } from 'src/common/pdf/results-pdf.builder';
export declare class LocalCallController {
    private readonly localCallService;
    constructor(localCallService: LocalCallService);
    getAll(dto: GetLocalCallsDto): Promise<(import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getById(id: string): Promise<import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    create(dto: LocalCallDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/local_call.schema").LocalCall, {}> & import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateLocalCallDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/local_call.schema").LocalCall, {}> & import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("../schemas/local_call.schema").LocalCall, {}> & import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/local_call.schema").LocalCall, {}> & import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("../schemas/local_call.schema").LocalCall, {}> & import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    addProject(id: string, dto: ProjectDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/local_call.schema").LocalCall, {}> & import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateProject(id: string, projectId: string, dto: UpdateProjectDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/local_call.schema").LocalCall, {}> & import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    deleteProject(id: string, projectId: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/local_call.schema").LocalCall, {}> & import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateProjectStatus(id: string, projectId: string, dto: UpdateStatusDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/local_call.schema").LocalCall, {}> & import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    addAnswers(dto: AddLocalCallAnswersDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/local_call.schema").LocalCall, {}> & import("../schemas/local_call.schema").LocalCall & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
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
    deleteFiles(dto: DeleteImagesDto): Promise<{
        success: boolean;
    }>;
    generateResultsPdf(id: string, lang?: ResultsPdfLang): Promise<StreamableFile>;
}
