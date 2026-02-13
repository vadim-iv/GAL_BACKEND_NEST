import { Type } from 'class-transformer'
import {
    IsArray,
    IsMongoId,
    IsNumber,
    IsObject,
    IsOptional,
    Min,
    Max,
    ValidateNested,
    IsString,
    IsDate,
} from 'class-validator'
import { MultiLangTextDto } from 'src/blogs/dto/multiLangText.dto'

export class ProjectAnswerDto {
    @IsMongoId()
    memberId: string

    @IsNumber()
    @Min(0)
    @Max(10)
    answer: number
}

export class ProjectQuestionDto {
    @IsObject()
    @ValidateNested()
    @Type(() => MultiLangTextDto)
    question: MultiLangTextDto

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProjectAnswerDto)
    @IsOptional()
    answers?: ProjectAnswerDto[]
}

export class ProjectDto {
    @IsObject()
    @ValidateNested()
    @Type(() => MultiLangTextDto)
    title: MultiLangTextDto

    @IsObject()
    @ValidateNested()
    @Type(() => MultiLangTextDto)
    description: MultiLangTextDto

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProjectQuestionDto)
    questions: ProjectQuestionDto[]

    @IsString()
    pdfUrl: string

    @Type(() => Date)
    @IsDate()
    voteStart: Date

    @Type(() => Date)
    @IsDate()
    voteEnd: Date
}