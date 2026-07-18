import { Model } from 'mongoose';
import { Member } from 'src/schemas/member.schema';
import { ManagementService } from 'src/management/management.service';
export declare class MemberSeedService {
    private memberModel;
    private readonly managementService;
    private readonly logger;
    constructor(memberModel: Model<Member>, managementService: ManagementService);
    seed(): Promise<{
        wiped: number;
        inserted: number;
    }>;
    private ensureEmailIndexIsSparse;
}
