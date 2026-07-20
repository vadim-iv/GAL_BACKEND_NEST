import { FONT_FAMILY } from './results-pdf.theme'

// Decision/local-call question text comes from the admin's rich-text editor
// (Tiptap) and is stored as HTML. The editor's toolbar only ever produces a
// small, known set of tags — bold (<strong>), underline (<u>), strikethrough
// (<s>), subscript/superscript (<sub>/<sup>), bullet/ordered lists
// (<ul>/<ol>/<li>), paragraphs (<p>) and line breaks (<br>) — so this is a
// purpose-built parser/renderer for exactly that set, not a general HTML-to-PDF
// engine. Italic (<em>) is intentionally not visually distinguished: the
// project's only embedded font (Onest) has no italic cut, and Google Fonts
// confirms the family doesn't ship one at all.
export const HTML_ENTITIES: Record<string, string> = {
	'&nbsp;': ' ',
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&apos;': "'"
}

export function decodeHtmlEntities(text: string): string {
	return text.replace(/&[a-z#0-9]+;/gi, (entity) => HTML_ENTITIES[entity.toLowerCase()] ?? entity)
}

export interface RichTextRun {
	text: string
	bold?: boolean
	underline?: boolean
	strike?: boolean
	sub?: boolean
	sup?: boolean
	// A forced line break (<br>) within the block — `text` is always '' on these.
	isBreak?: boolean
}

export type RichTextBlockType = 'paragraph' | 'bullet-item' | 'ordered-item'

export interface RichTextBlock {
	type: RichTextBlockType
	runs: RichTextRun[]
	number?: number
}

type Mark = 'bold' | 'underline' | 'strike' | 'sub' | 'sup'

const MARK_TAGS: Record<string, Mark> = {
	strong: 'bold',
	b: 'bold',
	u: 'underline',
	s: 'strike',
	strike: 'strike',
	del: 'strike',
	sub: 'sub',
	sup: 'sup'
}

const TOKEN_RE = /<\/?[a-zA-Z0-9]+[^>]*>|[^<]+/g
const TAG_NAME_RE = /^<\/?([a-zA-Z0-9]+)/

// Parses Tiptap's constrained HTML output into a flat list of blocks (one per
// paragraph or list item), each holding a run of styled text fragments —
// simple enough to lay out by hand in drawRichText/measureRichTextHeight
// without pulling in a full HTML/CSS layout engine.
export function parseRichText(html: string): RichTextBlock[] {
	if (!html) return []

	const blocks: RichTextBlock[] = []
	let currentBlock: RichTextBlock | null = null
	const markStack: Mark[] = []
	const listTypeStack: Array<'bullet' | 'ordered'> = []
	const listCounterStack: number[] = []
	let pendingBlockType: RichTextBlockType | null = null
	let pendingBlockNumber: number | undefined

	function activeMarks(): Pick<RichTextRun, Mark> {
		return {
			bold: markStack.includes('bold'),
			underline: markStack.includes('underline'),
			strike: markStack.includes('strike'),
			sub: markStack.includes('sub'),
			sup: markStack.includes('sup')
		}
	}

	function openBlock(type: RichTextBlockType, number?: number) {
		currentBlock = { type, runs: [], number }
		blocks.push(currentBlock)
	}

	function ensureBlock(): RichTextBlock {
		if (!currentBlock) {
			openBlock(pendingBlockType ?? 'paragraph', pendingBlockNumber)
			pendingBlockType = null
			pendingBlockNumber = undefined
		}
		return currentBlock as RichTextBlock
	}

	let match: RegExpExecArray | null
	while ((match = TOKEN_RE.exec(html))) {
		const token = match[0]

		if (token[0] !== '<') {
			const text = decodeHtmlEntities(token)
			if (!text) continue
			// Whitespace sitting between block-level tags (e.g. a formatting newline
			// in the stored HTML) isn't real content — only keep whitespace when it's
			// inside an already-open block, where it's a legitimate word separator.
			if (!currentBlock && !text.trim()) continue
			ensureBlock().runs.push({ text, ...activeMarks() })
			continue
		}

		const closing = token[1] === '/'
		const nameMatch = token.match(TAG_NAME_RE)
		const tag = nameMatch ? nameMatch[1].toLowerCase() : ''

		if (tag === 'br') {
			ensureBlock().runs.push({ text: '', isBreak: true })
			continue
		}

		if (tag === 'p' || tag === 'div' || tag === 'h1' || tag === 'h2' || tag === 'h3') {
			if (closing) {
				currentBlock = null
			} else {
				openBlock(pendingBlockType ?? 'paragraph', pendingBlockNumber)
				pendingBlockType = null
				pendingBlockNumber = undefined
			}
			continue
		}

		if (tag === 'ul') {
			if (!closing) listTypeStack.push('bullet')
			else listTypeStack.pop()
			continue
		}
		if (tag === 'ol') {
			if (!closing) {
				listTypeStack.push('ordered')
				listCounterStack.push(0)
			} else {
				listTypeStack.pop()
				listCounterStack.pop()
			}
			continue
		}
		if (tag === 'li') {
			if (!closing) {
				const listType = listTypeStack[listTypeStack.length - 1]
				if (listType === 'ordered') {
					listCounterStack[listCounterStack.length - 1]++
					pendingBlockType = 'ordered-item'
					pendingBlockNumber = listCounterStack[listCounterStack.length - 1]
				} else {
					pendingBlockType = 'bullet-item'
					pendingBlockNumber = undefined
				}
				currentBlock = null
			} else {
				currentBlock = null
				pendingBlockType = null
				pendingBlockNumber = undefined
			}
			continue
		}

		const mark = MARK_TAGS[tag]
		if (mark) {
			if (!closing) {
				markStack.push(mark)
			} else {
				const idx = markStack.lastIndexOf(mark)
				if (idx !== -1) markStack.splice(idx, 1)
			}
		}
		// Any other tag (including <em>/<i>, which carries no visual distinction
		// here — see the file-level note) is transparent: skipped itself, but its
		// text content still flows through normally.
	}

	return blocks.filter((block) => block.runs.some((run) => run.text || run.isBreak))
}

// Appends a plain-text run to the end of the last block (creating one if the
// parsed HTML was empty) — used for the local-call PDF's "(max: N)" suffix,
// which isn't part of the saved rich text.
export function appendPlainTextRun(blocks: RichTextBlock[], text: string): RichTextBlock[] {
	if (blocks.length === 0) return [{ type: 'paragraph', runs: [{ text }] }]
	const last = blocks[blocks.length - 1]
	last.runs.push({ text })
	return blocks
}

interface Token extends RichTextRun {
	isSpace?: boolean
}

function tokenizeRuns(runs: RichTextRun[]): Token[] {
	const tokens: Token[] = []
	for (const run of runs) {
		if (run.isBreak) {
			tokens.push({ ...run })
			continue
		}
		const parts = run.text.split(/(\s+)/).filter((part) => part !== '')
		for (const part of parts) {
			tokens.push({ ...run, text: part, isSpace: /^\s+$/.test(part) })
		}
	}
	return tokens
}

function fontSizeFor(token: Token, baseFontSize: number): number {
	return token.sub || token.sup ? baseFontSize * 0.7 : baseFontSize
}

function selectFont(doc: PDFKit.PDFDocument, token: Token, baseFontSize: number) {
	doc.font(token.bold ? FONT_FAMILY.semiBold : FONT_FAMILY.regular)
	doc.fontSize(fontSizeFor(token, baseFontSize))
}

const LIST_INDENT = 14
const LINE_HEIGHT_RATIO = 1.4
const BLOCK_GAP = 4

// Shared by measureRichTextHeight/drawRichText so the two can never disagree
// about how tall the content is — `draw: false` walks the exact same
// line-wrapping logic without emitting any PDFKit draw calls.
function layoutRichText(
	doc: PDFKit.PDFDocument,
	blocks: RichTextBlock[],
	x: number,
	y: number,
	width: number,
	baseFontSize: number,
	color: string,
	draw: boolean
): number {
	let cursorY = y
	const lineHeight = baseFontSize * LINE_HEIGHT_RATIO

	for (const block of blocks) {
		const isListItem = block.type !== 'paragraph'
		const indent = isListItem ? LIST_INDENT : 0
		const contentX = x + indent
		const contentWidth = width - indent

		if (isListItem && draw) {
			doc.font(FONT_FAMILY.regular)
			doc.fontSize(baseFontSize)
			doc.fillColor(color)
			const marker = block.type === 'bullet-item' ? '•' : `${block.number}.`
			doc.text(marker, x, cursorY, { width: indent, lineBreak: false })
		}

		const tokens = tokenizeRuns(block.runs)
		let lineX = contentX
		let lineHasContent = false

		for (const token of tokens) {
			if (token.isBreak) {
				cursorY += lineHeight
				lineX = contentX
				lineHasContent = false
				continue
			}

			selectFont(doc, token, baseFontSize)
			const tokenWidth = doc.widthOfString(token.text)

			if (token.isSpace) {
				if (lineHasContent) lineX += tokenWidth
				continue
			}

			if (lineHasContent && lineX + tokenWidth > contentX + contentWidth) {
				cursorY += lineHeight
				lineX = contentX
				lineHasContent = false
			}

			if (draw) {
				const size = fontSizeFor(token, baseFontSize)
				const yOffset = token.sup ? -(size * 0.4) : token.sub ? size * 0.25 : 0
				doc.fillColor(color)
				// A `width` is required here even though each token is drawn at its own
				// exact position: PDFKit only computes the textWidth/wordCount values
				// that underline/strike need to draw their line through its internal
				// LineWrapper, which is skipped entirely when no width is given —
				// without it those come out undefined, producing a "NaN" crash the
				// moment underline/strike is requested. Sized to the token's own
				// measured width so this never triggers an actual wrap.
				doc.text(token.text, lineX, cursorY + yOffset, {
					width: tokenWidth,
					lineBreak: false,
					underline: !!token.underline,
					strike: !!token.strike
				})
			}

			lineX += tokenWidth
			lineHasContent = true
		}

		cursorY += lineHeight + BLOCK_GAP
	}

	// The loop always adds a trailing BLOCK_GAP after the last block, which
	// isn't wanted for an outer height measurement.
	return cursorY - y - (blocks.length > 0 ? BLOCK_GAP : 0)
}

export function measureRichTextHeight(
	doc: PDFKit.PDFDocument,
	blocks: RichTextBlock[],
	width: number,
	baseFontSize: number
): number {
	return layoutRichText(doc, blocks, 0, 0, width, baseFontSize, '#000000', false)
}

export function drawRichText(
	doc: PDFKit.PDFDocument,
	blocks: RichTextBlock[],
	x: number,
	y: number,
	width: number,
	baseFontSize: number,
	color: string
): void {
	layoutRichText(doc, blocks, x, y, width, baseFontSize, color, true)
}
