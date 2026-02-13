import { IsArray, ValidateNested, IsString, IsNotEmpty, IsNumber, MinLength, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class SingleAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsNumber()
  answer: number;

  @IsString()
  @IsNotEmpty()
  memberId: string;
}

export class AddAnswersDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SingleAnswerDto)
  answers: SingleAnswerDto[];
}