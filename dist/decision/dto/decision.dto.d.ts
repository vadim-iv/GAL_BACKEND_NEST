import { MultiLangTextDto } from 'src/blogs/dto/multiLangText.dto';
import { DecisionQuestionType } from 'src/enums/decision.enum';
export declare class DecisionOptionDto {
    value: string;
    label: MultiLangTextDto;
}
export declare class DecisionAnswerDto {
    memberId: string;
    value: string;
}
export declare class DecisionQuestionDto {
    question: MultiLangTextDto;
    type: DecisionQuestionType;
    options?: DecisionOptionDto[];
    answers?: DecisionAnswerDto[];
}
export declare class DecisionDto {
    title: MultiLangTextDto;
    description: MultiLangTextDto;
    imageUrl?: string;
    questions: DecisionQuestionDto[];
    voteStart: Date;
    voteEnd: Date;
}
