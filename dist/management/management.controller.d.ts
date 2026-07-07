import { ManagementService } from './management.service';
import { UpdateMainImageDto } from './dto/update-main-image.dto';
export declare class ManagementController {
    private readonly managementService;
    constructor(managementService: ManagementService);
    getManagement(): Promise<import("mongoose").Document<unknown, {}, import("../schemas/management.schema").Management, {}> & import("../schemas/management.schema").Management & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateMainImage(dto: UpdateMainImageDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/management.schema").Management, {}> & import("../schemas/management.schema").Management & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    sync(): Promise<import("mongoose").Document<unknown, {}, import("../schemas/management.schema").Management, {}> & import("../schemas/management.schema").Management & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
