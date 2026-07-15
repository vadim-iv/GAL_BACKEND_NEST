import { Type } from 'class-transformer'
import { IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'
import { MultiLangTextDto } from 'src/blogs/dto/multiLangText.dto'
import { ApprovalStatusEnum } from 'src/enums/status.enum'

export class ProjectDto {
	@IsObject()
	@ValidateNested()
	@Type(() => MultiLangTextDto)
	title: MultiLangTextDto

	@IsObject()
	@ValidateNested()
	@Type(() => MultiLangTextDto)
	description: MultiLangTextDto

	@IsString()
	pdfUrl: string

	@IsOptional()
	@IsString()
	imageUrl?: string

	@IsOptional()
	@IsEnum(ApprovalStatusEnum)
	status?: ApprovalStatusEnum
}
