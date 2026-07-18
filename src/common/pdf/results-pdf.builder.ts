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
	drawVerticalBarChart,
	estimateHorizontalBarChartHeight,
	estimateVerticalBarChartHeight
} from './results-pdf.charts'
import { MultiLangTextLike, ResultsPdfLang, t, tr } from './results-pdf.i18n'
import { COLORS, FONT_FAMILY, FONT_SIZE, PAGE, SPACING, STATUS_PILL_HEIGHT } from './results-pdf.theme'

export { ResultsPdfLang } from './results-pdf.i18n'

// After population (both call sites populate `...answers.memberId`), memberId is a
// full Member subdocument rather than a raw ObjectId — this reads the id correctly
// either way, since only the distinct-voter count is ever needed here, never the
// member's name/email (that per-member display is exactly what's being removed).
// null when the member who cast that vote was later deleted — the populated
// reference has nothing left to resolve to, so there's no id to return.
function getMemberIdString(memberId: Types.ObjectId | { _id: Types.ObjectId } | null): string | null {
	if (!memberId) return null
	if (typeof memberId === 'object' && '_id' in memberId) {
		return memberId._id.toString()
	}
	return (memberId as Types.ObjectId).toString()
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

// Blends each project's answers into a single 0-10 mark, normalizing per-question
// since questions can each have their own maxScore.
function calculateAverageMark(
	questions: { _id: Types.ObjectId; maxScore: number }[],
	answers: { questionId: Types.ObjectId; answer: number }[]
): number {
	if (!answers || answers.length === 0) return 0

	const normalized = answers.map((a) => {
		const question = questions.find((q) => q._id.toString() === a.questionId.toString())
		const maxScore = question?.maxScore || 10
		return (a.answer / maxScore) * 10
	})

	return normalized.reduce((acc, val) => acc + val, 0) / normalized.length
}

function contentWidth(doc: PDFKit.PDFDocument): number {
	return doc.page.width - PAGE.margins.left - PAGE.margins.right
}

const HTML_ENTITIES: Record<string, string> = {
	'&nbsp;': ' ',
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&apos;': "'"
}

// The decision description comes from the admin's rich-text editor and is stored
// as HTML — this renders it as plain text for the PDF: block-level tags become
// line breaks (so paragraph structure survives), everything else is stripped.
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

		// Page 1 is created inside `createDocument()`, before this listener exists,
		// so it needs one explicit draw; every later page (explicit ensureSpace()
		// breaks or pdfkit's own overflow inside a long chart/list) fires the event.
		doc.on('pageAdded', () => drawHeader(doc))
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
	const questionLabel = t(question.question as MultiLangTextLike, lang)

	doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.sectionLabel)
	const labelHeight = doc.heightOfString(questionLabel, { width: innerWidth })

	const isChoice = question.type === DecisionQuestionType.RADIO || question.type === DecisionQuestionType.CHECKBOX
	const answers = question.answers || []

	let options: BarChartOption[] = []
	let textAnswers: string[] = []
	let bodyHeight = 0

	if (isChoice) {
		const tally = new Map<string, number>()
		for (const option of question.options || []) tally.set(option.value, 0)
		// CHECKBOX answers carry `values` (a respondent can count toward several
		// options at once) — RADIO answers carry a single `value`. `answers.length`
		// stays a valid "number of respondents" denominator either way, since one
		// answer doc is still pushed per member per question.
		for (const answer of answers) {
			const selected = question.type === DecisionQuestionType.CHECKBOX ? answer.values || [] : [answer.value]
			for (const value of selected) {
				if (!value) continue
				tally.set(value, (tally.get(value) || 0) + 1)
			}
		}
		options = (question.options || []).map((o) => ({
			label: t(o.label as MultiLangTextLike, lang),
			count: tally.get(o.value) || 0
		}))
		bodyHeight = estimateHorizontalBarChartHeight(doc, innerWidth, options, answers.length)
	} else {
		textAnswers = answers.map((a) => a.value || '')
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.small)
		bodyHeight =
			textAnswers.length === 0
				? doc.currentLineHeight()
				: textAnswers.reduce((sum, ans) => sum + doc.heightOfString(`•  ${ans}`, { width: innerWidth }) + 4, 0)
	}

	const cardHeight = SPACING.cardPadding * 2 + labelHeight + 10 + bodyHeight
	ensureSpace(doc, cardHeight + SPACING.cardGap)

	const cardTop = doc.y
	drawCard(doc, x, cardTop, width, cardHeight)

	doc
		.font(FONT_FAMILY.semiBold)
		.fontSize(FONT_SIZE.sectionLabel)
		.fillColor(COLORS.green700)
		.text(questionLabel, innerX, cardTop + SPACING.cardPadding, { width: innerWidth })

	const bodyTop = cardTop + SPACING.cardPadding + labelHeight + 10

	if (isChoice) {
		drawHorizontalBarChart(doc, innerX, bodyTop, innerWidth, options, answers.length, lang)
	} else if (textAnswers.length === 0) {
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.small).fillColor(COLORS.gray600).text(tr(lang, 'noResponsesYet'), innerX, bodyTop)
	} else {
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.small).fillColor(COLORS.gray700)
		let cursorY = bodyTop
		for (const ans of textAnswers) {
			doc.text(`•  ${ans}`, innerX, cursorY, { width: innerWidth })
			cursorY += doc.heightOfString(`•  ${ans}`, { width: innerWidth }) + 4
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
		const averageScoreValue = `${averageMark.toFixed(2)} / 10`
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
	const questionLabel = `${t(question.question as MultiLangTextLike, lang)}  (${tr(lang, 'maxLabel')} ${question.maxScore})`

	doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.sectionLabel)
	const labelHeight = doc.heightOfString(questionLabel, { width: innerWidth })

	const questionAnswers = (project.answers || []).filter((a) => a.questionId.toString() === question._id.toString())
	const buckets: ScoreBucket[] = Array.from({ length: question.maxScore + 1 }, (_, value) => ({
		value,
		count: questionAnswers.filter((a) => a.answer === value).length
	}))

	const bodyHeight = estimateVerticalBarChartHeight(doc, questionAnswers.length > 0)
	const cardHeight = SPACING.cardPadding * 2 + labelHeight + 10 + bodyHeight
	ensureSpace(doc, cardHeight + SPACING.cardGap)

	const cardTop = doc.y
	drawCard(doc, x, cardTop, width, cardHeight)

	doc
		.font(FONT_FAMILY.semiBold)
		.fontSize(FONT_SIZE.sectionLabel)
		.fillColor(COLORS.green700)
		.text(questionLabel, innerX, cardTop + SPACING.cardPadding, { width: innerWidth })

	if (questionAnswers.length > 0) {
		const mean = questionAnswers.reduce((sum, a) => sum + a.answer, 0) / questionAnswers.length
		doc
			.font(FONT_FAMILY.semiBold)
			.fontSize(FONT_SIZE.body)
			.fillColor(COLORS.green600)
			.text(`${mean.toFixed(1)} / ${question.maxScore}`, innerX, cardTop + SPACING.cardPadding, {
				width: innerWidth,
				align: 'right'
			})
	}

	const bodyTop = cardTop + SPACING.cardPadding + labelHeight + 10
	drawVerticalBarChart(doc, innerX, bodyTop, innerWidth, buckets, lang)

	doc.y = cardTop + cardHeight + SPACING.cardGap
}
