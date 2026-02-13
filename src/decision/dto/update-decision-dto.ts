import { PartialType } from '@nestjs/mapped-types';
import { DecisionDto } from './decision.dto';

export class UpdateDecisionDto extends PartialType(DecisionDto) {}