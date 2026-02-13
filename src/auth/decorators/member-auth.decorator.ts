import { UseGuards } from '@nestjs/common';
import { MembersJwtAuthGuard } from '../guards/members-jwt.guard';

export const MemberAuth = () => UseGuards(MembersJwtAuthGuard);