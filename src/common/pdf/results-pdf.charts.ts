import { COLORS, FONT_FAMILY, FONT_SIZE } from './results-pdf.theme'
import { ResultsPdfLang, tr } from './results-pdf.i18n'

const BAR_HEIGHT = 10
const BAR_GAP = 14
const LABEL_GAP = 4
const TRACK_TO_COUNT_GAP = 8
const COUNT_LABEL_RESERVED = 64

const VERTICAL_CHART_HEIGHT = 100
const VERTICAL_CHART_TOP_GAP = 16
const VERTICAL_CHART_AXIS_HEIGHT = 14

// Shortens text to fit within maxLines by first dropping whole words, then falling
// back to character-by-character for a single very long word/token. pdfkit has no
// built-in ellipsis truncation, so this remeasures with doc.heightOfString until it fits.
export function truncateToLines(doc: PDFKit.PDFDocument, text: string, width: number, maxLines: number): string {
	const maxHeight = doc.currentLineHeight() * maxLines + 1
	if (doc.heightOfString(text, { width }) <= maxHeight) return text

	const words = text.split(' ')
	while (words.length > 1) {
		words.pop()
		const candidate = `${words.join(' ')}…`
		if (doc.heightOfString(candidate, { width }) <= maxHeight) return candidate
	}

	let word = words[0] || ''
	while (word.length > 1) {
		word = word.slice(0, -1)
		const candidate = `${word}…`
		if (doc.heightOfString(candidate, { width }) <= maxHeight) return candidate
	}
	return '…'
}

export interface BarChartOption {
	label: string
	count: number
}

export function estimateHorizontalBarChartHeight(
	doc: PDFKit.PDFDocument,
	width: number,
	options: BarChartOption[],
	totalRespondents: number
): number {
	const trackWidth = width - COUNT_LABEL_RESERVED
	doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.small)

	let height = totalRespondents === 0 ? doc.currentLineHeight() + LABEL_GAP : 0
	for (const option of options) {
		const truncated = truncateToLines(doc, option.label, trackWidth, 2)
		height += doc.heightOfString(truncated, { width: trackWidth }) + LABEL_GAP + BAR_HEIGHT + BAR_GAP
	}
	return height
}

// One row per option, in the caller's original order (mirrors how Google Forms
// renders choice-question results — not sorted by vote count). Label sits above a
// pill-shaped track; percentage is computed against totalRespondents, but the bar
// FILL is scaled against the leading option's count so the top result always reads
// as a full bar, matching Forms' visual behavior.
export function drawHorizontalBarChart(
	doc: PDFKit.PDFDocument,
	x: number,
	y: number,
	width: number,
	options: BarChartOption[],
	totalRespondents: number,
	lang: ResultsPdfLang
): number {
	const trackWidth = width - COUNT_LABEL_RESERVED
	const maxCount = Math.max(1, ...options.map((o) => o.count))
	let cursorY = y

	if (totalRespondents === 0) {
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.small).fillColor(COLORS.gray600)
		doc.text(tr(lang, 'noVotesYet'), x, cursorY)
		cursorY += doc.currentLineHeight() + LABEL_GAP
	}

	for (const option of options) {
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.small).fillColor(COLORS.gray700)
		const truncated = truncateToLines(doc, option.label, trackWidth, 2)
		doc.text(truncated, x, cursorY, { width: trackWidth })
		cursorY += doc.heightOfString(truncated, { width: trackWidth }) + LABEL_GAP

		doc.roundedRect(x, cursorY, trackWidth, BAR_HEIGHT, BAR_HEIGHT / 2).fill(COLORS.gray400)
		if (option.count > 0) {
			const fillWidth = Math.max(BAR_HEIGHT, trackWidth * (option.count / maxCount))
			doc.roundedRect(x, cursorY, fillWidth, BAR_HEIGHT, BAR_HEIGHT / 2).fill(COLORS.green600)
		}

		const pct = totalRespondents > 0 ? Math.round((option.count / totalRespondents) * 100) : 0
		doc
			.font(FONT_FAMILY.regular)
			.fontSize(FONT_SIZE.small)
			.fillColor(COLORS.gray600)
			.text(`${option.count} (${pct}%)`, x + trackWidth + TRACK_TO_COUNT_GAP, cursorY - 1, {
				width: COUNT_LABEL_RESERVED - TRACK_TO_COUNT_GAP,
				align: 'left'
			})

		cursorY += BAR_HEIGHT + BAR_GAP
	}

	return cursorY
}

export interface ScoreBucket {
	value: number
	count: number
}

export function estimateVerticalBarChartHeight(doc: PDFKit.PDFDocument, hasAnswers: boolean): number {
	if (!hasAnswers) {
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.small)
		return doc.currentLineHeight() + BAR_GAP
	}
	return VERTICAL_CHART_TOP_GAP + VERTICAL_CHART_HEIGHT + VERTICAL_CHART_AXIS_HEIGHT
}

// One bar per integer score value (0..maxScore inclusive), Google Forms' "linear
// scale" results style. Bar height is proportional to how many members picked that
// value; count labels only appear above non-zero bars where there's headroom.
export function drawVerticalBarChart(
	doc: PDFKit.PDFDocument,
	x: number,
	y: number,
	width: number,
	buckets: ScoreBucket[],
	lang: ResultsPdfLang
): number {
	const maxCount = Math.max(0, ...buckets.map((b) => b.count))

	if (maxCount === 0) {
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.small).fillColor(COLORS.gray600)
		doc.text(tr(lang, 'noAnswersYet'), x, y)
		return y + doc.currentLineHeight() + BAR_GAP
	}

	const chartBottom = y + VERTICAL_CHART_TOP_GAP + VERTICAL_CHART_HEIGHT
	const n = buckets.length
	const barWidth = (width / n) * 0.75
	const gap = (width / n) * 0.25

	buckets.forEach((bucket, i) => {
		const barX = x + i * (barWidth + gap) + gap / 2

		if (bucket.count > 0) {
			const barHeight = VERTICAL_CHART_HEIGHT * (bucket.count / maxCount)
			doc.roundedRect(barX, chartBottom - barHeight, barWidth, barHeight, 3).fill(COLORS.green600)

			const labelY = chartBottom - barHeight - 12
			if (labelY >= y) {
				doc
					.font(FONT_FAMILY.regular)
					.fontSize(FONT_SIZE.small)
					.fillColor(COLORS.gray600)
					.text(String(bucket.count), barX, labelY, { width: barWidth, align: 'center' })
			}
		}

		doc
			.font(FONT_FAMILY.regular)
			.fontSize(FONT_SIZE.small)
			.fillColor(COLORS.gray600)
			.text(String(bucket.value), barX, chartBottom + 4, { width: barWidth, align: 'center' })
	})

	return chartBottom + 4 + VERTICAL_CHART_AXIS_HEIGHT
}
