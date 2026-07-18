import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Member } from 'src/schemas/member.schema';
import { ManagementService } from 'src/management/management.service';
export declare class MemberSeedService implements OnModuleInit {
    private memberModel;
    private readonly managementService;
    private readonly logger;
    constructor(memberModel: Model<Member>, managementService: ManagementService);
    onModuleInit(): Promise<void>;
    private ensureEmailIndexIsSparse;
}
