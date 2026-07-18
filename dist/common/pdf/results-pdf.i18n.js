"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = t;
exports.tr = tr;
function t(value, lang) {
    if (!value)
        return '';
    return value[lang] || value.ro || '';
}
const LABELS = {
    ro: {
        statusPending: 'În așteptarea aprobării',
        statusApproved: 'Aprobat',
        statusRejected: 'Respins',
        statusClosed: 'Închis',
        statusOpen: 'În desfășurare',
        totalVoters: 'Total votanți',
        deletedMemberSingular: 'membru șters',
        deletedMemberPlural: 'membri șterși',
        and: 'și',
        averageScore: 'Scor mediu',
        voteWindow: 'Perioada de vot',
        generatedOn: 'Generat la',
        page: 'Pagina',
        noVotesYet: 'Niciun vot încă',
        noAnswersYet: 'Niciun răspuns încă',
        noResponsesYet: 'Niciun răspuns încă',
        respondents: 'respondenți',
        maxLabel: 'max'
    },
    ru: {
        statusPending: 'Ожидает одобрения',
        statusApproved: 'Одобрено',
        statusRejected: 'Отклонено',
        statusClosed: 'Закрыто',
        statusOpen: 'В процессе',
        totalVoters: 'Всего проголосовало',
        deletedMemberSingular: 'удалённый участник',
        deletedMemberPlural: 'удалённых участников',
        and: 'и',
        averageScore: 'Средний балл',
        voteWindow: 'Период голосования',
        generatedOn: 'Сформировано',
        page: 'Страница',
        noVotesYet: 'Голосов пока нет',
        noAnswersYet: 'Ответов пока нет',
        noResponsesYet: 'Ответов пока нет',
        respondents: 'респондентов',
        maxLabel: 'макс'
    },
    en: {
        statusPending: 'Pending approval',
        statusApproved: 'Approved',
        statusRejected: 'Rejected',
        statusClosed: 'Closed',
        statusOpen: 'Ongoing',
        totalVoters: 'Total voters',
        deletedMemberSingular: 'deleted member',
        deletedMemberPlural: 'deleted members',
        and: 'and',
        averageScore: 'Average score',
        voteWindow: 'Vote window',
        generatedOn: 'Generated on',
        page: 'Page',
        noVotesYet: 'No votes yet',
        noAnswersYet: 'No answers yet',
        noResponsesYet: 'No responses yet',
        respondents: 'respondents',
        maxLabel: 'max'
    }
};
function tr(lang, key) {
    return LABELS[lang][key];
}
//# sourceMappingURL=results-pdf.i18n.js.map