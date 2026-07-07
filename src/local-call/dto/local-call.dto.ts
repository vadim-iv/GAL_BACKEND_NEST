import { Type } from 'class-transformer'
import {
	IsArray,
	IsDate,
	IsInt,
	IsObject,
	IsOptional,
	IsString,
	Max,
	Min,
	ValidateNested,
	ArrayMinSize
} from 'class-validator'
import { MultiLangTextDto } from 'src/blogs/dto/multiLangText.dto'

export class LocalCallQuestionDto {
	@IsObject()
	@ValidateNested()
	@Type(() => MultiLangTextDto)
	question: MultiLangTextDto

	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(10)
	maxScore?: number
}

export class LocalCallDto {
	@IsObject()
	@ValidateNested()
	@Type(() => MultiLangTextDto)
	name: MultiLangTextDto

	@IsObject()
	@ValidateNested()
	@Type(() => MultiLangTextDto)
	description: MultiLangTextDto

	@IsOptional()
	@IsString()
	imageUrl?: string

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => LocalCallQuestionDto)
	questions: LocalCallQuestionDto[]

	@Type(() => Date)
	@IsDate()
	voteStart: Date

	@Type(() => Date)
	@IsDate()
	voteEnd: Date
}
