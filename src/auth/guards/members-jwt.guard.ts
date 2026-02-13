import { AuthGuard } from '@nestjs/passport';

export class MembersJwtAuthGuard extends AuthGuard('member-jwt') {}