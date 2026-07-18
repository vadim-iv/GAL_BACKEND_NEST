import { Model } from 'mongoose';
import { Management, ManagementDocument } from 'src/schemas/management.schema';
import { TMember } from 'src/schemas/member.schema';
export declare class ManagementService {
    private managementModel;
    private memberModel;
    constructor(managementModel: Model<ManagementDocument>, memberModel: Model<TMember>);
    getManagement(): Promise<import("mongoose").Document<unknown, {}, Management, {}> & Management & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateMainImage(main_image: string): Promise<import("mongoose").Document<unknown, {}, Management, {}> & Management & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    syncFromMembers(): Promise<void>;
    search(query: string, limit?: number): Promise<any[]>;
    private toPlainText;
    private formatPresidentDetail;
    private formatShortDetail;
    private buildPresident;
    private buildColumns;
    private buildMultiLangText;
    private emptyMultiLangText;
}
