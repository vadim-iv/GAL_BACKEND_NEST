import { Types } from 'mongoose'
import { LocalCallDocument, LocalCallQuestion, Project } from 'src/schemas/local_call.schema'
import { DecisionDocument, DecisionQuestion } from 'src/schemas/decision.schema'
import { DecisionQuestionType } from 'src/enums/decision.enum'
import {
	createDocument,
	drawCard,
	drawDecisionStatusPill,
	drawFooter,
	drawHeader,
	drawStatTile,
	drawStatusPill,
	ensureSpace,
	formatDate,
	measureDecisionStatusPillWidth,
	measureStatTileHeight,
	measureStatusPillWidth,
	registerFonts
} from './results-pdf.layout'
import {
	BarChartOption,
	ScoreBucket,
	drawHorizontalBarChart,
	drawScoreNames,
	drawVerticalBarChart,
	estimateHorizontalBarChartHeight,
	estimateScoreNamesHeight,
	estimateVerticalBarChartHeight
} from './results-pdf.charts'
import { MultiLangTextLike, ResultsPdfLang, t, tr } from './results-pdf.i18n'
import { HTML_ENTITIES, drawRichText, measureRichTextHeight, parseRichText } from './results-pdf.richtext'
import { COLORS, FONT_FAMILY, FONT_SIZE, PAGE, SPACING, STATUS_PILL_HEIGHT } from './results-pdf.theme'

export { ResultsPdfLang } from './results-pdf.i18n'

// After population (both call sites populate `...answers.memberId`), memberId is a
// full Member subdocument rather than a raw ObjectId — this reads the id correctly
// either way. null when the member who cast that vote was later deleted — the
// populated reference has nothing left to resolve to, so there's no id to return.
function getMemberIdString(memberId: Types.ObjectId | { _id: Types.ObjectId } | null): string | null {
	if (!memberId) return null
	if (typeof memberId === 'object' && '_id' in memberId) {
		return memberId._id.toString()
	}
	return (memberId as Types.ObjectId).toString()
}

// Same populated-vs-raw-ObjectId situation as getMemberIdString, but resolving
// to the member's own display name instead of their id, for the "who voted for
// what" names shown next to each chart. Returns null when memberId no longer
// resolves (deleted after voting) — deleted members are deliberately left out
// of the names lists entirely; their vote still counts in the aggregate
// totals/tallies (that's tracked separately, via getMemberIdString/the
// deleted-voters note), just not attributed to a name.
function resolveMemberName(
	memberId: Types.ObjectId | { _id: Types.ObjectId; name?: MultiLangTextLike } | null,
	lang: ResultsPdfLang
): string | null {
	if (memberId && typeof memberId === 'object' && 'name' in memberId && memberId.name) {
		return t(memberId.name, lang)
	}
	return null
}

// A deleted member's votes stay on the decision/project forever (their answer
// subdocuments are never removed) — only the populated memberId resolves to null,
// since there's nothing left to point to. That means a deleted member's identity
// can't be deduped the way a real member's can: every null looks identical,
// whether it's the same person's answer to several questions or several different
// deleted people. The best available proxy for "how many distinct people were
// deleted" is the HIGHEST per-question count of null-memberId answers — every
// deleted member contributes exactly one such answer to every question they
// originally answered (submissions cover every question at once), so the
// question with the most null answers had at least that many distinct deleted
// voters.
function countDeletedVoters(perQuestionAnswers: { memberId: unknown }[][]): number {
	return Math.max(0, ...perQuestionAnswers.map((answers) => answers.filter((a) => !a.memberId).length))
}

// Drawn inline right after the main voter count (see drawStatTile's
// secondaryValue), styled smaller and in a muted color so it still reads as a
// deemphasized aside rather than part of the headline number.
function getDeletedVotersNote(deletedVoters: number, lang: ResultsPdfLang): string | undefined {
	if (deletedVoters === 0) return undefined
	const word = tr(lang, deletedVoters === 1 ? 'deletedMemberSingular' : 'deletedMemberPlural')
	return `(${tr(lang, 'and')} ${deletedVoters} ${word})`
}

// The project's overall mark: each question's own maxScore points sums into
// the denominator (regardless of whether it has been answered yet), and each
// question's own average response (across everyone who answered it) sums into
// the numerator — e.g. a 7-question local call with maxScore 10/10/10/10/8/8/8
// (64 total) where respondents averaged well on most of them nets a result
// like 19.5/64, not a 0-10 normalized blend.
function calculateAverageMark(
	questions: { _id: Types.ObjectId; maxScore: number }[],
	answers: { questionId: Types.ObjectId; answer: number }[]
): { sum: number; max: number } {
	let sum = 0
	let max = 0

	for (const question of questions) {
		max += question.maxScore

		const questionAnswers = (answers || []).filter((a) => a.questionId.toString() === question._id.toString())
		if (questionAnswers.length > 0) {
			sum += questionAnswers.reduce((acc, a) => acc + a.answer, 0) / questionAnswers.length
		}
	}

	return { sum, max }
}

function contentWidth(doc: PDFKit.PDFDocument): number {
	return doc.page.width - PAGE.margins.left - PAGE.margins.right
}

// Decision/local-call descriptions come from the admin's rich-text editor and
// are stored as HTML — this renders them as plain text for the PDF: block-level
// tags become line breaks (so paragraph structure survives), everything else is
// stripped. Question text uses the real formatting-aware renderer in
// results-pdf.richtext.ts instead (see renderDecisionQuestion/renderProjectQuestion).
function stripHtml(html: string): string {
	return html
		.replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&[a-z#0-9]+;/gi, (entity) => HTML_ENTITIES[entity.toLowerCase()] ?? entity)
		.replace(/\n{2,}/g, '\n')
		.trim()
}

function renderToBuffer(lang: ResultsPdfLang, render: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const doc = createDocument()
		registerFonts(doc)
		const chunks: Buffer[] = []

		doc.on('data', (chunk: Buffer) => chunks.push(chunk))
		doc.on('end', () => resolve(Buffer.concat(chunks)))
		doc.on('error', reject)

		// The logo/org-name header only belongs on page 1. Every later page
		// (explicit ensureSpace() breaks or pdfkit's own overflow inside a long
		// chart/list) instead shrinks its top margin down to match the side
		// margins and starts content right there, since there's no header
		// reserving that space anymore.
		doc.on('pageAdded', () => {
			doc.page.margins.top = PAGE.margins.left
			doc.x = PAGE.margins.left
			doc.y = doc.page.margins.top
		})
		// Page 1 is created inside `createDocument()`, before the listener above
		// exists, so it needs one explicit draw.
		drawHeader(doc)

		render(doc)

		const range = doc.bufferedPageRange()
		for (let i = range.start; i < range.start + range.count; i++) {
			doc.switchToPage(i)
			drawFooter(doc, i, range.count, lang)
		}

		doc.end()
	})
}

function drawTitleBlock(doc: PDFKit.PDFDocument, x: number, width: number, title: string, subtitle?: string): void {
	if (subtitle) {
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.body).fillColor(COLORS.gray600).text(subtitle, x, doc.y, { width })
		doc.moveDown(0.2)
	}
	doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.title).fillColor(COLORS.green700).text(title, x, doc.y, { width })
	doc.moveDown(0.6)
}

export async function buildDecisionResultsPdf(
	decision: DecisionDocument,
	lang: ResultsPdfLang = 'ro'
): Promise<Buffer> {
	const title = t(decision.title as MultiLangTextLike, lang)

	return renderToBuffer(lang, (doc) => {
		const x = PAGE.margins.left
		const width = contentWidth(doc)

		drawTitleBlock(doc, x, width, title)

		const description = stripHtml(t(decision.description as MultiLangTextLike, lang))
		if (description) {
			doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.body).fillColor(COLORS.gray700).text(description, x, doc.y, { width })
			doc.y += 16
		}

		const totalVoters = new Set(
			decision.questions
				.flatMap((q) => (q.answers || []).map((a) => getMemberIdString(a.memberId)))
				.filter((id): id is string => id !== null)
		).size
		const deletedVoters = countDeletedVoters(decision.questions.map((q) => q.answers || []))
		const deletedVotersNote = getDeletedVotersNote(deletedVoters, lang)

		const statTop = doc.y
		const statGap = 16
		const pillWidth = measureDecisionStatusPillWidth(doc, decision.status, lang)
		const tileWidth = (width - pillWidth - statGap * 2) / 2
		const voteWindowText = `${formatDate(decision.voteStart)} - ${formatDate(decision.voteEnd)}`
		const voteWindowLabel = tr(lang, 'voteWindow')
		const totalVotersLabel = tr(lang, 'totalVoters')

		const rowHeight = Math.max(
			STATUS_PILL_HEIGHT,
			measureStatTileHeight(doc, tileWidth, voteWindowLabel, voteWindowText),
			measureStatTileHeight(doc, tileWidth, totalVotersLabel, String(totalVoters), deletedVotersNote)
		)

		const pill = drawDecisionStatusPill(doc, x, statTop + (rowHeight - STATUS_PILL_HEIGHT) / 2, decision.status, lang)
		const tile1Bottom = drawStatTile(doc, x + pillWidth + statGap, statTop, tileWidth, voteWindowLabel, voteWindowText)
		const tile2Bottom = drawStatTile(
			doc,
			x + pillWidth + statGap + tileWidth + statGap,
			statTop,
			tileWidth,
			totalVotersLabel,
			String(totalVoters),
			deletedVotersNote
		)

		doc.y = Math.max(pill.bottom, tile1Bottom, tile2Bottom) + 24

		for (const question of decision.questions) {
			renderDecisionQuestion(doc, question, x, width, lang)
		}
	})
}

function renderDecisionQuestion(
	doc: PDFKit.PDFDocument,
	question: DecisionQuestion,
	x: number,
	width: number,
	lang: ResultsPdfLang
): void {
	const innerX = x + SPACING.cardPadding
	const innerWidth = width - SPACING.cardPadding * 2
	const questionBlocks = parseRichText(t(question.question as MultiLangTextLike, lang))
	const labelHeight = measureRichTextHeight(doc, questionBlocks, innerWidth, FONT_SIZE.sectionLabel)

	const isChoice = question.type === DecisionQuestionType.RADIO || question.type === DecisionQuestionType.CHECKBOX
	const answers = question.answers || []

	let options: BarChartOption[] = []
	let textAnswers: { name: string; value: string }[] = []
	let bodyHeight = 0

	if (isChoice) {
		const tally = new Map<string, number>()
		const namesByOption = new Map<string, string[]>()
		for (const option of question.options || []) {
			tally.set(option.value, 0)
			namesByOption.set(option.value, [])
		}
		// CHECKBOX answers carry `values` (a respondent can count toward several
		// options at once, and so can appear in more than one option's names
		// list) — RADIO answers carry a single `value`. `answers.length` stays a
		// valid "number of respondents" denominator either way, since one answer
		// doc is still pushed per member per question.
		for (const answer of answers) {
			const selected = question.type === DecisionQuestionType.CHECKBOX ? answer.values || [] : [answer.value]
			const memberName = resolveMemberName(answer.memberId, lang)
			for (const value of selected) {
				if (!value) continue
				tally.set(value, (tally.get(value) || 0) + 1)
				if (memberName) namesByOption.get(value)?.push(memberName)
			}
		}
		options = (question.options || []).map((o) => ({
			label: t(o.label as MultiLangTextLike, lang),
			count: tally.get(o.value) || 0,
			names: namesByOption.get(o.value) || []
		}))
		bodyHeight = estimateHorizontalBarChartHeight(doc, innerWidth, options, answers.length)
	} else {
		textAnswers = answers
			.map((a) => ({ name: resolveMemberName(a.memberId, lang), value: a.value || '' }))
			.filter((a): a is { name: string; value: string } => a.name !== null)
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.small)
		bodyHeight =
			textAnswers.length === 0
				? doc.currentLineHeight()
				: textAnswers.reduce((sum, a) => sum + doc.heightOfString(`•  ${a.name}: ${a.value}`, { width: innerWidth }) + 4, 0)
	}

	const cardHeight = SPACING.cardPadding * 2 + labelHeight + 10 + bodyHeight
	ensureSpace(doc, cardHeight + SPACING.cardGap)

	const cardTop = doc.y
	drawCard(doc, x, cardTop, width, cardHeight)

	drawRichText(doc, questionBlocks, innerX, cardTop + SPACING.cardPadding, innerWidth, FONT_SIZE.sectionLabel, COLORS.green700)

	const bodyTop = cardTop + SPACING.cardPadding + labelHeight + 10

	if (isChoice) {
		drawHorizontalBarChart(doc, innerX, bodyTop, innerWidth, options, answers.length, lang)
	} else if (textAnswers.length === 0) {
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.small).fillColor(COLORS.gray600).text(tr(lang, 'noResponsesYet'), innerX, bodyTop)
	} else {
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.small).fillColor(COLORS.gray700)
		let cursorY = bodyTop
		for (const a of textAnswers) {
			const line = `•  ${a.name}: ${a.value}`
			doc.text(line, innerX, cursorY, { width: innerWidth })
			cursorY += doc.heightOfString(line, { width: innerWidth }) + 4
		}
	}

	doc.y = cardTop + cardHeight + SPACING.cardGap
}

export async function buildProjectResultsPdf(
	localCall: LocalCallDocument,
	project: Project,
	lang: ResultsPdfLang = 'ro'
): Promise<Buffer> {
	const title = t(project.title as MultiLangTextLike, lang)
	const subtitle = t(localCall.name as MultiLangTextLike, lang)

	return renderToBuffer(lang, (doc) => {
		const x = PAGE.margins.left
		const width = contentWidth(doc)

		drawTitleBlock(doc, x, width, title, subtitle)

		const totalVoters = new Set(
			(project.answers || [])
				.map((a) => getMemberIdString(a.memberId))
				.filter((id): id is string => id !== null)
		).size
		// project.answers is flat (one entry per question per member, not nested per
		// question like a decision's) — group by questionId first so
		// countDeletedVoters can compare "answers to the same question" against each
		// other, same as it does for decisions.
		const answersByQuestion = new Map<string, { memberId: unknown }[]>()
		for (const answer of project.answers || []) {
			const key = answer.questionId.toString()
			answersByQuestion.set(key, [...(answersByQuestion.get(key) || []), answer])
		}
		const deletedVoters = countDeletedVoters([...answersByQuestion.values()])
		const deletedVotersNote = getDeletedVotersNote(deletedVoters, lang)
		const averageMark = calculateAverageMark(localCall.questions, project.answers)

		const statTop = doc.y
		const statGap = 16
		const pillWidth = measureStatusPillWidth(doc, project.status, lang)
		const tileWidth = (width - pillWidth - statGap * 2) / 2
		const averageScoreLabel = tr(lang, 'averageScore')
		const averageScoreValue = `${averageMark.sum.toFixed(1)}/${averageMark.max}`
		const totalVotersLabel = tr(lang, 'totalVoters')

		const rowHeight = Math.max(
			STATUS_PILL_HEIGHT,
			measureStatTileHeight(doc, tileWidth, averageScoreLabel, averageScoreValue),
			measureStatTileHeight(doc, tileWidth, totalVotersLabel, String(totalVoters), deletedVotersNote)
		)

		const pill = drawStatusPill(doc, x, statTop + (rowHeight - STATUS_PILL_HEIGHT) / 2, project.status, lang)
		const tile1Bottom = drawStatTile(
			doc,
			x + pillWidth + statGap,
			statTop,
			tileWidth,
			averageScoreLabel,
			averageScoreValue
		)
		const tile2Bottom = drawStatTile(
			doc,
			x + pillWidth + statGap + tileWidth + statGap,
			statTop,
			tileWidth,
			totalVotersLabel,
			String(totalVoters),
			deletedVotersNote
		)

		doc.y = Math.max(pill.bottom, tile1Bottom, tile2Bottom) + 24

		for (const question of localCall.questions) {
			renderProjectQuestion(doc, question, project, x, width, lang)
		}
	})
}

function renderProjectQuestion(
	doc: PDFKit.PDFDocument,
	question: LocalCallQuestion,
	project: Project,
	x: number,
	width: number,
	lang: ResultsPdfLang
): void {
	const innerX = x + SPACING.cardPadding
	const innerWidth = width - SPACING.cardPadding * 2

	const questionAnswers = (project.answers || []).filter((a) => a.questionId.toString() === question._id.toString())
	const mean = questionAnswers.length > 0 ? questionAnswers.reduce((sum, a) => sum + a.answer, 0) / questionAnswers.length : 0
	const scoreText = questionAnswers.length > 0 ? `${mean.toFixed(1)} / ${question.maxScore}` : ''

	// The mean/maxScore badge sits top-right, on the same line the question text
	// starts on — reserve its width (plus a gap) out of the question's wrap
	// width up front, rather than letting the two overlap when the question's
	// first line happens to run the full width of the card.
	const scoreGap = 12
	let scoreWidth = 0
	if (scoreText) {
		doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.body)
		scoreWidth = doc.widthOfString(scoreText) + scoreGap
	}
	const questionWidth = innerWidth - scoreWidth

	const questionBlocks = parseRichText(t(question.question as MultiLangTextLike, lang))
	const labelHeight = measureRichTextHeight(doc, questionBlocks, questionWidth, FONT_SIZE.sectionLabel)

	const buckets: ScoreBucket[] = Array.from({ length: question.maxScore + 1 }, (_, value) => {
		const bucketAnswers = questionAnswers.filter((a) => a.answer === value)
		return {
			value,
			count: bucketAnswers.length,
			names: bucketAnswers.map((a) => resolveMemberName(a.memberId, lang)).filter((name): name is string => name !== null)
		}
	})

	const namesHeight = estimateScoreNamesHeight(doc, buckets, innerWidth)
	const bodyHeight = estimateVerticalBarChartHeight(doc, questionAnswers.length > 0) + namesHeight
	const cardHeight = SPACING.cardPadding * 2 + labelHeight + 10 + bodyHeight
	ensureSpace(doc, cardHeight + SPACING.cardGap)

	const cardTop = doc.y
	drawCard(doc, x, cardTop, width, cardHeight)

	drawRichText(doc, questionBlocks, innerX, cardTop + SPACING.cardPadding, questionWidth, FONT_SIZE.sectionLabel, COLORS.green700)

	if (scoreText) {
		doc
			.font(FONT_FAMILY.semiBold)
			.fontSize(FONT_SIZE.body)
			.fillColor(COLORS.green600)
			.text(scoreText, innerX, cardTop + SPACING.cardPadding, {
				width: innerWidth,
				align: 'right'
			})
	}

	const bodyTop = cardTop + SPACING.cardPadding + labelHeight + 10
	const chartBottom = drawVerticalBarChart(doc, innerX, bodyTop, innerWidth, buckets, lang)
	drawScoreNames(doc, innerX, chartBottom, buckets, innerWidth)

	doc.y = cardTop + cardHeight + SPACING.cardGap
}
