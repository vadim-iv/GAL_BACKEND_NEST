declare class SingleAnswerDto {
    questionId: string;
    answer: number;
    memberId: string;
}
export declare class AddAnswersDto {
    projectId: string;
    answers: SingleAnswerDto[];
}
export {};
