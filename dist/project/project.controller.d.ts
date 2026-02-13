import { ProjectService } from './project.service';
import { GetProjectsDto } from './dto/get-projects.dto';
import { ProjectDto } from './dto/project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { DeleteImagesDto } from 'src/blogs/dto/delete-images.dto';
import { AddAnswersDto } from './dto/add-answers.dto';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    getAll(getProjectsDto: GetProjectsDto): Promise<{
        averageMark: number;
        _id: import("mongoose").Types.ObjectId;
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
        questions: import("../schemas/project.schema").ProjectQuestion[];
        voteStart: Date;
        voteEnd: Date;
        __v: number;
    }[]>;
    getById(id: string): Promise<{
        averageMark: number;
        _id: import("mongoose").Types.ObjectId;
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
        questions: import("../schemas/project.schema").ProjectQuestion[];
        voteStart: Date;
        voteEnd: Date;
        __v: number;
    }>;
    create(dto: ProjectDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/project.schema").Project, {}> & import("../schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    addAnswers(dto: AddAnswersDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/project.schema").Project, {}> & import("../schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("../schemas/project.schema").Project, {}> & import("../schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateProjectDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/project.schema").Project, {}> & import("../schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("../schemas/project.schema").Project, {}> & import("../schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/project.schema").Project, {}> & import("../schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("../schemas/project.schema").Project, {}> & import("../schemas/project.schema").Project & {
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
    deleteProjectFiles(dto: DeleteImagesDto): Promise<{
        success: boolean;
    }>;
}
