import { MultiLangTextDto } from 'src/blogs/dto/multiLangText.dto';
export declare class ProjectAnswerDto {
    memberId: string;
    answer: number;
}
export declare class ProjectQuestionDto {
    question: MultiLangTextDto;
    answers?: ProjectAnswerDto[];
}
export declare class ProjectDto {
    title: MultiLangTextDto;
    description: MultiLangTextDto;
    questions: ProjectQuestionDto[];
    pdfUrl: string;
    voteStart: Date;
    voteEnd: Date;
}
