import { Type } from 'class-transformer'
import { IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'
import { MultiLangTextDto } from 'src/blogs/dto/multiLangText.dto'

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
}
