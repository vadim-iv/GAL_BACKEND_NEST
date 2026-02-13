import { Type } from "class-transformer"
import { IsArray, IsMongoId, IsNotEmpty, IsString, ValidateNested } from "class-validator"

class SingleDecisionAnswerDto {

  @IsMongoId()
  questionId: string

  @IsString()
  @IsNotEmpty()
  value: string

  @IsMongoId()
  memberId: string
}

export class AddDecisionAnswersDto {

  @IsMongoId()
  decisionId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleDecisionAnswerDto)
  answers: SingleDecisionAnswerDto[]
}
