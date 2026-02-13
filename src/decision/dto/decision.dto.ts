import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize
} from 'class-validator';
import { MultiLangTextDto } from 'src/blogs/dto/multiLangText.dto';
import { DecisionQuestionType } from 'src/enums/decision.enum';

export class DecisionOptionDto {
  @IsString()
  value: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangTextDto)
  label: MultiLangTextDto;
}

export class DecisionAnswerDto {
  @IsMongoId()
  memberId: string;

  @IsString()
  value: string;
}

export class DecisionQuestionDto {
  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangTextDto)
  question: MultiLangTextDto;

  @IsEnum(DecisionQuestionType)
  type: DecisionQuestionType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DecisionOptionDto)
  options?: DecisionOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DecisionAnswerDto)
  answers?: DecisionAnswerDto[];
}

export class DecisionDto {
  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangTextDto)
  title: MultiLangTextDto;

  @IsObject()
  @ValidateNested()
  @Type(() => MultiLangTextDto)
  description: MultiLangTextDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DecisionQuestionDto)
  questions: DecisionQuestionDto[];

  @Type(() => Date)
  @IsDate()
  voteStart: Date;

  @Type(() => Date)
  @IsDate()
  voteEnd: Date;
}