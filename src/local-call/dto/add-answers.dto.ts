import { Type } from 'class-transformer'
import { IsArray, ArrayMinSize, IsMongoId, IsNumber, Min, Max, ValidateNested } from 'class-validator'

class SingleLocalCallAnswerDto {
	@IsMongoId()
	questionId: string

	@IsNumber()
	@Min(0)
	@Max(10)
	answer: number

	@IsMongoId()
	memberId: string
}

export class AddLocalCallAnswersDto {
	@IsMongoId()
	localCallId: string

	@IsMongoId()
	projectId: string

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => SingleLocalCallAnswerDto)
	answers: SingleLocalCallAnswerDto[]
}
