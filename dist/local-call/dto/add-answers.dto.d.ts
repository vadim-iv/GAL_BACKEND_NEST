declare class SingleLocalCallAnswerDto {
    questionId: string;
    answer: number;
    memberId: string;
}
export declare class AddLocalCallAnswersDto {
    localCallId: string;
    projectId: string;
    answers: SingleLocalCallAnswerDto[];
}
export {};
