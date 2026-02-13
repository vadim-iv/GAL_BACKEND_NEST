import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { MembersService } from 'src/members/members.service';
declare const MembersJwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class MembersJwtStrategy extends MembersJwtStrategy_base {
    private configService;
    private membersService;
    constructor(configService: ConfigService, membersService: MembersService);
    validate({ id }: {
        id: string;
    }): Promise<(import("../schemas/member.schema").Member & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
}
export {};
