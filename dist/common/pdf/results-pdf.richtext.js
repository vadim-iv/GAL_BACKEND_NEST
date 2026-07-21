"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTML_ENTITIES = void 0;
exports.decodeHtmlEntities = decodeHtmlEntities;
exports.parseRichText = parseRichText;
exports.appendPlainTextRun = appendPlainTextRun;
exports.measureRichTextHeight = measureRichTextHeight;
exports.drawRichText = drawRichText;
const results_pdf_theme_1 = require("./results-pdf.theme");
exports.HTML_ENTITIES = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'"
};
function decodeHtmlEntities(text) {
    return text.replace(/&[a-z#0-9]+;/gi, (entity) => exports.HTML_ENTITIES[entity.toLowerCase()] ?? entity);
}
const MARK_TAGS = {
    strong: 'bold',
    b: 'bold',
    u: 'underline',
    s: 'strike',
    strike: 'strike',
    del: 'strike',
    sub: 'sub',
    sup: 'sup'
};
const TOKEN_RE = /<\/?[a-zA-Z0-9]+[^>]*>|[^<]+/g;
const TAG_NAME_RE = /^<\/?([a-zA-Z0-9]+)/;
function parseRichText(html) {
    if (!html)
        return [];
    const blocks = [];
    let currentBlock = null;
    const markStack = [];
    const listTypeStack = [];
    const listCounterStack = [];
    let pendingBlockType = null;
    let pendingBlockNumber;
    function activeMarks() {
        return {
            bold: markStack.includes('bold'),
            underline: markStack.includes('underline'),
            strike: markStack.includes('strike'),
            sub: markStack.includes('sub'),
            sup: markStack.includes('sup')
        };
    }
    function openBlock(type, number) {
        currentBlock = { type, runs: [], number };
        blocks.push(currentBlock);
    }
    function ensureBlock() {
        if (!currentBlock) {
            openBlock(pendingBlockType ?? 'paragraph', pendingBlockNumber);
            pendingBlockType = null;
            pendingBlockNumber = undefined;
        }
        return currentBlock;
    }
    let match;
    while ((match = TOKEN_RE.exec(html))) {
        const token = match[0];
        if (token[0] !== '<') {
            const text = decodeHtmlEntities(token);
            if (!text)
                continue;
            if (!currentBlock && !text.trim())
                continue;
            ensureBlock().runs.push({ text, ...activeMarks() });
            continue;
        }
        const closing = token[1] === '/';
        const nameMatch = token.match(TAG_NAME_RE);
        const tag = nameMatch ? nameMatch[1].toLowerCase() : '';
        if (tag === 'br') {
            ensureBlock().runs.push({ text: '', isBreak: true });
            continue;
        }
        if (tag === 'p' || tag === 'div' || tag === 'h1' || tag === 'h2' || tag === 'h3') {
            if (closing) {
                currentBlock = null;
            }
            else {
                openBlock(pendingBlockType ?? 'paragraph', pendingBlockNumber);
                pendingBlockType = null;
                pendingBlockNumber = undefined;
            }
            continue;
        }
        if (tag === 'ul') {
            if (!closing)
                listTypeStack.push('bullet');
            else
                listTypeStack.pop();
            continue;
        }
        if (tag === 'ol') {
            if (!closing) {
                listTypeStack.push('ordered');
                listCounterStack.push(0);
            }
            else {
                listTypeStack.pop();
                listCounterStack.pop();
            }
            continue;
        }
        if (tag === 'li') {
            if (!closing) {
                const listType = listTypeStack[listTypeStack.length - 1];
                if (listType === 'ordered') {
                    listCounterStack[listCounterStack.length - 1]++;
                    pendingBlockType = 'ordered-item';
                    pendingBlockNumber = listCounterStack[listCounterStack.length - 1];
                }
                else {
                    pendingBlockType = 'bullet-item';
                    pendingBlockNumber = undefined;
                }
                currentBlock = null;
            }
            else {
                currentBlock = null;
                pendingBlockType = null;
                pendingBlockNumber = undefined;
            }
            continue;
        }
        const mark = MARK_TAGS[tag];
        if (mark) {
            if (!closing) {
                markStack.push(mark);
            }
            else {
                const idx = markStack.lastIndexOf(mark);
                if (idx !== -1)
                    markStack.splice(idx, 1);
            }
        }
    }
    return blocks.filter((block) => block.runs.some((run) => run.text || run.isBreak));
}
function appendPlainTextRun(blocks, text) {
    if (blocks.length === 0)
        return [{ type: 'paragraph', runs: [{ text }] }];
    const last = blocks[blocks.length - 1];
    last.runs.push({ text });
    return blocks;
}
function tokenizeRuns(runs) {
    const tokens = [];
    for (const run of runs) {
        if (run.isBreak) {
            tokens.push({ ...run });
            continue;
        }
        const parts = run.text.split(/(\s+)/).filter((part) => part !== '');
        for (const part of parts) {
            tokens.push({ ...run, text: part, isSpace: /^\s+$/.test(part) });
        }
    }
    return tokens;
}
function fontSizeFor(token, baseFontSize) {
    return token.sub || token.sup ? baseFontSize * 0.7 : baseFontSize;
}
function selectFont(doc, token, baseFontSize) {
    doc.font(token.bold ? results_pdf_theme_1.FONT_FAMILY.semiBold : results_pdf_theme_1.FONT_FAMILY.regular);
    doc.fontSize(fontSizeFor(token, baseFontSize));
}
const LIST_INDENT = 14;
const LINE_HEIGHT_RATIO = 1.4;
const BLOCK_GAP = 4;
function layoutRichText(doc, blocks, x, y, width, baseFontSize, color, draw) {
    let cursorY = y;
    const lineHeight = baseFontSize * LINE_HEIGHT_RATIO;
    for (const block of blocks) {
        const isListItem = block.type !== 'paragraph';
        const indent = isListItem ? LIST_INDENT : 0;
        const contentX = x + indent;
        const contentWidth = width - indent;
        if (isListItem && draw) {
            doc.font(results_pdf_theme_1.FONT_FAMILY.regular);
            doc.fontSize(baseFontSize);
            doc.fillColor(color);
            const marker = block.type === 'bullet-item' ? '•' : `${block.number}.`;
            doc.text(marker, x, cursorY, { width: indent, lineBreak: false });
        }
        const tokens = tokenizeRuns(block.runs);
        let lineX = contentX;
        let lineHasContent = false;
        for (const token of tokens) {
            if (token.isBreak) {
                cursorY += lineHeight;
                lineX = contentX;
                lineHasContent = false;
                continue;
            }
            selectFont(doc, token, baseFontSize);
            if (token.isSpace) {
                const spaceWidth = doc.widthOfString(token.text);
                if (lineHasContent)
                    lineX += spaceWidth;
                continue;
            }
            let remaining = token.text;
            while (remaining.length > 0) {
                const availableWidth = contentX + contentWidth - lineX;
                const remainingWidth = doc.widthOfString(remaining);
                let piece;
                let pieceWidth;
                if (remainingWidth <= availableWidth || (!lineHasContent && remainingWidth <= contentWidth)) {
                    piece = remaining;
                    pieceWidth = remainingWidth;
                }
                else if (lineHasContent) {
                    cursorY += lineHeight;
                    lineX = contentX;
                    lineHasContent = false;
                    continue;
                }
                else {
                    piece = remaining;
                    pieceWidth = remainingWidth;
                    while (piece.length > 1 && pieceWidth > contentWidth) {
                        piece = piece.slice(0, -1);
                        pieceWidth = doc.widthOfString(piece);
                    }
                }
                if (draw) {
                    const size = fontSizeFor(token, baseFontSize);
                    const yOffset = token.sup ? -(size * 0.4) : token.sub ? size * 0.25 : 0;
                    doc.fillColor(color);
                    doc.text(piece, lineX, cursorY + yOffset, {
                        width: pieceWidth,
                        lineBreak: false,
                        underline: !!token.underline,
                        strike: !!token.strike
                    });
                }
                lineX += pieceWidth;
                lineHasContent = true;
                remaining = remaining.slice(piece.length);
                if (remaining.length > 0) {
                    cursorY += lineHeight;
                    lineX = contentX;
                    lineHasContent = false;
                }
            }
        }
        cursorY += lineHeight + BLOCK_GAP;
    }
    return cursorY - y - (blocks.length > 0 ? BLOCK_GAP : 0);
}
function measureRichTextHeight(doc, blocks, width, baseFontSize) {
    return layoutRichText(doc, blocks, 0, 0, width, baseFontSize, '#000000', false);
}
function drawRichText(doc, blocks, x, y, width, baseFontSize, color) {
    layoutRichText(doc, blocks, x, y, width, baseFontSize, color, true);
}
//# sourceMappingURL=results-pdf.richtext.js.map