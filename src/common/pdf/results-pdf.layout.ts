import * as PDFDocument from 'pdfkit'
import * as fs from 'fs'
import SVGtoPDF = require('svg-to-pdfkit')
import { ApprovalStatusEnum } from 'src/enums/status.enum'
import { DecisionStatusEnum } from 'src/enums/decision-status.enum'
import { COLORS, FONT_FAMILY, FONT_PATHS, FONT_SIZE, LOGO_SVG_PATH, PAGE, SPACING, STATUS_PILL_HEIGHT } from './results-pdf.theme'
import { LabelKey, ResultsPdfLang, tr } from './results-pdf.i18n'

const LOGO_SVG = fs.readFileSync(LOGO_SVG_PATH, 'utf-8')

const HEADER_LOGO_SIZE = 24
const HEADER_TOP = 30
const STAT_TILE_HEIGHT = 44
const STAT_TILE_PADDING = 10
const ORGANIZATION_NAME = 'GAL Stejarul Dacilor'

export function createDocument(): PDFKit.PDFDocument {
	return new PDFDocument({ size: PAGE.size, margins: PAGE.margins, bufferPages: true })
}

export function registerFonts(doc: PDFKit.PDFDocument): void {
	doc.registerFont(FONT_FAMILY.regular, FONT_PATHS.regular)
	doc.registerFont(FONT_FAMILY.semiBold, FONT_PATHS.semiBold)
}

// Draws only with absolute x/y coordinates in the reserved top-margin band —
// never touches doc.x/doc.y — so it's safe to call both explicitly (page 1,
// whose creation happens inside the PDFDocument constructor and therefore fires
// before any 'pageAdded' listener can be attached) and from a 'pageAdded'
// handler (every page after that, including ones pdfkit creates implicitly on
// content overflow).
export function drawHeader(doc: PDFKit.PDFDocument): void {
	const x = PAGE.margins.left
	const y = HEADER_TOP

	SVGtoPDF(doc, LOGO_SVG, x, y, {
		width: HEADER_LOGO_SIZE,
		height: HEADER_LOGO_SIZE,
		preserveAspectRatio: 'xMidYMid meet'
	})

	doc
		.font(FONT_FAMILY.semiBold)
		.fontSize(FONT_SIZE.subtitle)
		.fillColor(COLORS.green700)
		.text(ORGANIZATION_NAME, x + HEADER_LOGO_SIZE + 10, y + HEADER_LOGO_SIZE / 2 - 6, {
			width: doc.page.width - PAGE.margins.left - PAGE.margins.right - HEADER_LOGO_SIZE - 10,
			height: doc.currentLineHeight(),
			ellipsis: true
		})

	const ruleY = y + HEADER_LOGO_SIZE + 10
	doc
		.moveTo(x, ruleY)
		.lineTo(doc.page.width - PAGE.margins.right, ruleY)
		.lineWidth(1)
		.strokeColor(COLORS.green500)
		.stroke()

	// pdfkit's .text() advances doc.y even when given explicit coordinates, which
	// would otherwise leave the cursor stranded inside the header band instead of
	// at the top of the reserved content area for whatever draws next.
	doc.x = PAGE.margins.left
	doc.y = PAGE.margins.top
}

// Total page count is only known once rendering finishes — this must be called
// from a post-render loop over doc.bufferedPageRange() (requires
// { bufferPages: true } on the document), never from 'pageAdded'.
export function drawFooter(doc: PDFKit.PDFDocument, pageIndex: number, totalPages: number, lang: ResultsPdfLang): void {
	const y = doc.page.height - PAGE.margins.bottom + 20
	const generatedText = `${tr(lang, 'generatedOn')} ${formatDate(new Date())}`
	const pageText = `${tr(lang, 'page')} ${pageIndex + 1} / ${totalPages}`

	// Drawing inside the reserved bottom margin band still trips pdfkit's own
	// overflow-driven auto-pagination (it checks against page.maxY() regardless of
	// explicit x/y) — zero the bottom margin for the duration of this draw so it
	// doesn't spawn a spurious extra page, then restore it immediately after.
	const originalBottomMargin = doc.page.margins.bottom
	doc.page.margins.bottom = 0

	doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.footer).fillColor(COLORS.gray600)
	doc.text(generatedText, PAGE.margins.left, y, { width: 250, align: 'left', lineBreak: false })
	doc.text(pageText, doc.page.width - PAGE.margins.right - 150, y, { width: 150, align: 'right', lineBreak: false })

	doc.page.margins.bottom = originalBottomMargin
}

export function ensureSpace(doc: PDFKit.PDFDocument, requiredHeight: number): void {
	const bottom = doc.page.height - PAGE.margins.bottom
	if (doc.y + requiredHeight > bottom) {
		doc.addPage()
	}
}

export function drawCard(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number): void {
	doc
		.roundedRect(x, y, width, height, SPACING.cardRadius)
		.lineWidth(1)
		.fillAndStroke(COLORS.white, COLORS.gray500)
}

const STAT_TILE_TOP_PAD = 8
const STAT_TILE_LABEL_VALUE_GAP = 5
const STAT_TILE_BOTTOM_PAD = 8
const STAT_TILE_VALUE_SECONDARY_GAP = 4

// Distance in points from the top of a text box down to its baseline, for
// whichever font/size is currently active on `doc`. Mirrors pdfkit's own
// internal usage of this exact metric (see its `list()` implementation) —
// `ascender` is expressed in 1/1000-em units, same convention pdfkit's own
// Font#lineHeight() uses. Not exposed as a public pdfkit API, hence the cast;
// this is the only reliable way to align baselines between two different font
// sizes/weights, since "bottom of line box" (heightOfString/currentLineHeight)
// includes leading that isn't proportional to font size the same way for both.
function fontBaselineOffset(doc: PDFKit.PDFDocument): number {
	const internal = doc as unknown as { _font: { ascender: number }; _fontSize: number }
	return (internal._font.ascender / 1000) * internal._fontSize
}

// True when value + a small gap + secondaryValue fit on one line within
// innerWidth at their respective font sizes — if not, the note is drawn on its
// own line below the value instead (see drawStatTile), which needs extra
// reserved height.
function secondaryValueFitsInline(
	doc: PDFKit.PDFDocument,
	innerWidth: number,
	value: string,
	secondaryValue: string
): boolean {
	doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.statValue)
	const valueWidth = doc.widthOfString(value)
	doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.statValueSecondary)
	const secondaryWidth = doc.widthOfString(secondaryValue)
	return valueWidth + STAT_TILE_VALUE_SECONDARY_GAP + secondaryWidth <= innerWidth
}

// secondaryValue is an optional deemphasized note drawn right after the main
// value (e.g. "12 (and 2 deleted members)") — smaller and in a muted color so it
// still reads as secondary rather than part of the headline number.
// Exposed separately from drawStatTile so callers can lay out sibling elements
// (e.g. vertically centering the status pill) against the tile's real height
// before anything is drawn — height depends on how much the value text wraps
// (a date range can take 1 or 2 lines), so it can't be assumed up front.
export function measureStatTileHeight(
	doc: PDFKit.PDFDocument,
	width: number,
	label: string,
	value: string,
	secondaryValue?: string
): number {
	const innerWidth = width - STAT_TILE_PADDING * 2

	doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.statLabel)
	const labelHeight = doc.heightOfString(label, { width: innerWidth })

	doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.statValue)
	const valueHeight = doc.heightOfString(value, { width: innerWidth })

	// If the note doesn't fit next to the value, it wraps below — reserve room
	// for it at its own (smaller) font size instead of the value's.
	let wrappedSecondaryHeight = 0
	if (secondaryValue && !secondaryValueFitsInline(doc, innerWidth, value, secondaryValue)) {
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.statValueSecondary)
		wrappedSecondaryHeight = doc.heightOfString(secondaryValue, { width: innerWidth })
	}

	return Math.max(
		STAT_TILE_HEIGHT,
		STAT_TILE_TOP_PAD + labelHeight + STAT_TILE_LABEL_VALUE_GAP + valueHeight + wrappedSecondaryHeight + STAT_TILE_BOTTOM_PAD
	)
}

export function drawStatTile(
	doc: PDFKit.PDFDocument,
	x: number,
	y: number,
	width: number,
	label: string,
	value: string,
	secondaryValue?: string
): number {
	const innerWidth = width - STAT_TILE_PADDING * 2
	const topPad = STAT_TILE_TOP_PAD
	const gap = STAT_TILE_LABEL_VALUE_GAP

	doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.statLabel)
	const labelHeight = doc.heightOfString(label, { width: innerWidth })

	const height = measureStatTileHeight(doc, width, label, value, secondaryValue)

	doc.roundedRect(x, y, width, height, 6).fill(COLORS.gray300)

	doc
		.font(FONT_FAMILY.regular)
		.fontSize(FONT_SIZE.statLabel)
		.fillColor(COLORS.gray600)
		.text(label, x + STAT_TILE_PADDING, y + topPad, { width: innerWidth })

	doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.statValue)
	const valueY = y + topPad + labelHeight + gap
	const valueHeight = doc.heightOfString(value, { width: innerWidth })
	doc.fillColor(COLORS.green700).text(value, x + STAT_TILE_PADDING, valueY, { width: innerWidth })

	if (secondaryValue) {
		const fitsInline = secondaryValueFitsInline(doc, innerWidth, value, secondaryValue)
		doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.statValue)
		const valueWidth = doc.widthOfString(value)
		const valueBaseline = fontBaselineOffset(doc)
		doc.font(FONT_FAMILY.regular).fontSize(FONT_SIZE.statValueSecondary)

		if (fitsInline) {
			// Manually positioned (not PDFKit's `continued` text flow) so the smaller
			// note's BASELINE can be lined up with the value's baseline — matching
			// "bottom of line box" (via heightOfString/currentLineHeight) isn't the
			// same thing, since that box includes leading that differs between font
			// sizes/weights. fontBaselineOffset gives the actual top-of-text-to-
			// baseline distance for whichever font/size is currently active.
			const secondaryBaseline = fontBaselineOffset(doc)
			const secondaryY = valueY + valueBaseline - secondaryBaseline
			doc
				.fillColor(COLORS.errorPale)
				.text(secondaryValue, x + STAT_TILE_PADDING + valueWidth + STAT_TILE_VALUE_SECONDARY_GAP, secondaryY, {
					width: innerWidth - valueWidth - STAT_TILE_VALUE_SECONDARY_GAP
				})
		} else {
			doc
				.fillColor(COLORS.errorPale)
				.text(secondaryValue, x + STAT_TILE_PADDING, valueY + valueHeight, { width: innerWidth })
		}
	}

	return y + height
}

const STATUS_COLOR: Record<ApprovalStatusEnum, string> = {
	[ApprovalStatusEnum.PENDING]: COLORS.gray600,
	[ApprovalStatusEnum.APPROVED]: COLORS.green600,
	[ApprovalStatusEnum.REJECTED]: COLORS.error
}

const STATUS_LABEL_KEY: Record<ApprovalStatusEnum, LabelKey> = {
	[ApprovalStatusEnum.PENDING]: 'statusPending',
	[ApprovalStatusEnum.APPROVED]: 'statusApproved',
	[ApprovalStatusEnum.REJECTED]: 'statusRejected'
}

// Width only depends on the label text, not position — exposed separately so
// callers can lay out sibling elements (e.g. stat tiles starting after the pill)
// before the pill itself is drawn.
export function measureStatusPillWidth(doc: PDFKit.PDFDocument, status: ApprovalStatusEnum, lang: ResultsPdfLang): number {
	const label = tr(lang, STATUS_LABEL_KEY[status])
	doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.small)
	return doc.widthOfString(label) + 20
}

export function drawStatusPill(
	doc: PDFKit.PDFDocument,
	x: number,
	y: number,
	status: ApprovalStatusEnum,
	lang: ResultsPdfLang
): { width: number; bottom: number } {
	const label = tr(lang, STATUS_LABEL_KEY[status])
	const pillHeight = STATUS_PILL_HEIGHT
	const pillWidth = measureStatusPillWidth(doc, status, lang)

	doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.small)
	doc.roundedRect(x, y, pillWidth, pillHeight, pillHeight / 2).fill(STATUS_COLOR[status])
	doc.fillColor(COLORS.white).text(label, x, y + 5, { width: pillWidth, align: 'center' })

	return { width: pillWidth, bottom: y + pillHeight }
}

// Decisions have their own 2-value status (pending/closed) — separate from
// projects' ApprovalStatusEnum, mirroring the frontend's split into
// DecisionStatusBadge vs StatusBadge rather than reusing/overloading one map.
const DECISION_STATUS_COLOR: Record<DecisionStatusEnum, string> = {
	[DecisionStatusEnum.PENDING]: COLORS.gray600,
	[DecisionStatusEnum.CLOSED]: COLORS.green600
}

const DECISION_STATUS_LABEL_KEY: Record<DecisionStatusEnum, LabelKey> = {
	[DecisionStatusEnum.PENDING]: 'statusOpen',
	[DecisionStatusEnum.CLOSED]: 'statusClosed'
}

// Falls back to PENDING for any value outside the current 2-state enum — e.g. a
// decision saved before the pending/approved/rejected → pending/closed migration,
// which would otherwise index these Records with `undefined` and break rendering.
function resolveDecisionStatus(status: DecisionStatusEnum): DecisionStatusEnum {
	return status in DECISION_STATUS_COLOR ? status : DecisionStatusEnum.PENDING
}

export function measureDecisionStatusPillWidth(
	doc: PDFKit.PDFDocument,
	status: DecisionStatusEnum,
	lang: ResultsPdfLang
): number {
	const label = tr(lang, DECISION_STATUS_LABEL_KEY[resolveDecisionStatus(status)])
	doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.small)
	return doc.widthOfString(label) + 20
}

export function drawDecisionStatusPill(
	doc: PDFKit.PDFDocument,
	x: number,
	y: number,
	status: DecisionStatusEnum,
	lang: ResultsPdfLang
): { width: number; bottom: number } {
	const resolvedStatus = resolveDecisionStatus(status)
	const label = tr(lang, DECISION_STATUS_LABEL_KEY[resolvedStatus])
	const pillHeight = STATUS_PILL_HEIGHT
	const pillWidth = measureDecisionStatusPillWidth(doc, status, lang)

	doc.font(FONT_FAMILY.semiBold).fontSize(FONT_SIZE.small)
	doc.roundedRect(x, y, pillWidth, pillHeight, pillHeight / 2).fill(DECISION_STATUS_COLOR[resolvedStatus])
	doc.fillColor(COLORS.white).text(label, x, y + 5, { width: pillWidth, align: 'center' })

	return { width: pillWidth, bottom: y + pillHeight }
}

export function formatDate(date: Date): string {
	const dd = String(date.getDate()).padStart(2, '0')
	const mm = String(date.getMonth() + 1).padStart(2, '0')
	return `${dd}.${mm}.${date.getFullYear()}`
}
