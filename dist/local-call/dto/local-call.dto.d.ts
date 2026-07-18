import { MultiLangTextDto } from 'src/blogs/dto/multiLangText.dto';
export declare class LocalCallQuestionDto {
    _id?: string;
    question: MultiLangTextDto;
    maxScore?: number;
}
export declare class LocalCallDto {
    name: MultiLangTextDto;
    description: MultiLangTextDto;
    imageUrl?: string;
    questions: LocalCallQuestionDto[];
    voteStart: Date;
    voteEnd: Date;
}
