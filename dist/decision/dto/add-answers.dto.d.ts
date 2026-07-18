declare class SingleDecisionAnswerDto {
    questionId: string;
    value?: string;
    values?: string[];
    memberId: string;
}
export declare class AddDecisionAnswersDto {
    decisionId: string;
    answers: SingleDecisionAnswerDto[];
}
export {};
