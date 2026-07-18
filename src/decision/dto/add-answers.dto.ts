import { Type } from "class-transformer"
import { IsArray, IsMongoId, IsOptional, IsString, ValidateNested } from "class-validator"

class SingleDecisionAnswerDto {

  @IsMongoId()
  questionId: string

  // Single selected value — used by RADIO/TEXT questions.
  @IsOptional()
  @IsString()
  value?: string

  // Selected option values — used by CHECKBOX (multi-select) questions instead of `value`.
  // Whether `value` or `values` is required depends on the question's type, which the DTO
  // layer can't see — that per-type enforcement happens in DecisionService.addAnswers().
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[]

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
