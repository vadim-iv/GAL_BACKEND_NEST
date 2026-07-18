import { MultiLangTextDto } from 'src/blogs/dto/multiLangText.dto';
import { DecisionQuestionType } from 'src/enums/decision.enum';
import { DecisionStatusEnum } from 'src/enums/decision-status.enum';
export declare class DecisionOptionDto {
    value: string;
    label: MultiLangTextDto;
}
export declare class DecisionAnswerDto {
    memberId: string;
    value?: string;
    values?: string[];
}
export declare class DecisionQuestionDto {
    _id?: string;
    question: MultiLangTextDto;
    type: DecisionQuestionType;
    options?: DecisionOptionDto[];
    answers?: DecisionAnswerDto[];
}
export declare class DecisionDto {
    title: MultiLangTextDto;
    description: MultiLangTextDto;
    imageUrl?: string;
    status?: DecisionStatusEnum;
    questions: DecisionQuestionDto[];
    voteStart: Date;
    voteEnd: Date;
}
