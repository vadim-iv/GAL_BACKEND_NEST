import { IsEnum } from 'class-validator'
import { ApprovalStatusEnum } from 'src/enums/status.enum'

export class UpdateStatusDto {
	@IsEnum(ApprovalStatusEnum)
	status: ApprovalStatusEnum
}
