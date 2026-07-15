export type ResultsPdfLang = 'ro' | 'ru' | 'en'

export type MultiLangTextLike = { ro: string; ru: string; en: string }

export function t(value: MultiLangTextLike | undefined, lang: ResultsPdfLang): string {
	if (!value) return ''
	return value[lang] || value.ro || ''
}

// Status wording mirrors the copy already shipped in GAL/messages/{ro,ru,en}.json
// (status_pending/status_approved/status_rejected/status_closed) for consistency
// with the site — the backend has no next-intl, so this is a small hardcoded
// dictionary instead. statusApproved/statusRejected are project-only (decisions
// use statusPending/statusClosed) but stay here since projects still need them.
const LABELS = {
	ro: {
		statusPending: 'În așteptarea aprobării',
		statusApproved: 'Aprobat',
		statusRejected: 'Respins',
		statusClosed: 'Închis',
		statusOpen: 'În desfășurare',
		totalVoters: 'Total votanți',
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
} as const satisfies Record<ResultsPdfLang, Record<string, string>>

export type LabelKey = keyof (typeof LABELS)['ro']

export function tr(lang: ResultsPdfLang, key: LabelKey): string {
	return LABELS[lang][key]
}
