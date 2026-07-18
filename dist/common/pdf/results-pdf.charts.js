"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncateToLines = truncateToLines;
exports.estimateHorizontalBarChartHeight = estimateHorizontalBarChartHeight;
exports.drawHorizontalBarChart = drawHorizontalBarChart;
exports.estimateVerticalBarChartHeight = estimateVerticalBarChartHeight;
exports.drawVerticalBarChart = drawVerticalBarChart;
const results_pdf_theme_1 = require("./results-pdf.theme");
const results_pdf_i18n_1 = require("./results-pdf.i18n");
const BAR_HEIGHT = 10;
const BAR_GAP = 14;
const LABEL_GAP = 4;
const TRACK_TO_COUNT_GAP = 8;
const COUNT_LABEL_RESERVED = 64;
const VERTICAL_CHART_HEIGHT = 100;
const VERTICAL_CHART_TOP_GAP = 16;
const VERTICAL_CHART_AXIS_HEIGHT = 14;
function truncateToLines(doc, text, width, maxLines) {
    const maxHeight = doc.currentLineHeight() * maxLines + 1;
    if (doc.heightOfString(text, { width }) <= maxHeight)
        return text;
    const words = text.split(' ');
    while (words.length > 1) {
        words.pop();
        const candidate = `${words.join(' ')}…`;
        if (doc.heightOfString(candidate, { width }) <= maxHeight)
            return candidate;
    }
    let word = words[0] || '';
    while (word.length > 1) {
        word = word.slice(0, -1);
        const candidate = `${word}…`;
        if (doc.heightOfString(candidate, { width }) <= maxHeight)
            return candidate;
    }
    return '…';
}
function estimateHorizontalBarChartHeight(doc, width, options, totalRespondents) {
    const trackWidth = width - COUNT_LABEL_RESERVED;
    doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.small);
    let height = totalRespondents === 0 ? doc.currentLineHeight() + LABEL_GAP : 0;
    for (const option of options) {
        const truncated = truncateToLines(doc, option.label, trackWidth, 2);
        height += doc.heightOfString(truncated, { width: trackWidth }) + LABEL_GAP + BAR_HEIGHT + BAR_GAP;
    }
    return height;
}
function drawHorizontalBarChart(doc, x, y, width, options, totalRespondents, lang) {
    const trackWidth = width - COUNT_LABEL_RESERVED;
    const maxCount = Math.max(1, ...options.map((o) => o.count));
    let cursorY = y;
    if (totalRespondents === 0) {
        doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.small).fillColor(results_pdf_theme_1.COLORS.gray600);
        doc.text((0, results_pdf_i18n_1.tr)(lang, 'noVotesYet'), x, cursorY);
        cursorY += doc.currentLineHeight() + LABEL_GAP;
    }
    for (const option of options) {
        doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.small).fillColor(results_pdf_theme_1.COLORS.gray700);
        const truncated = truncateToLines(doc, option.label, trackWidth, 2);
        doc.text(truncated, x, cursorY, { width: trackWidth });
        cursorY += doc.heightOfString(truncated, { width: trackWidth }) + LABEL_GAP;
        doc.roundedRect(x, cursorY, trackWidth, BAR_HEIGHT, BAR_HEIGHT / 2).fill(results_pdf_theme_1.COLORS.gray400);
        if (option.count > 0) {
            const fillWidth = Math.max(BAR_HEIGHT, trackWidth * (option.count / maxCount));
            doc.roundedRect(x, cursorY, fillWidth, BAR_HEIGHT, BAR_HEIGHT / 2).fill(results_pdf_theme_1.COLORS.green600);
        }
        const pct = totalRespondents > 0 ? Math.round((option.count / totalRespondents) * 100) : 0;
        doc
            .font(results_pdf_theme_1.FONT_FAMILY.regular)
            .fontSize(results_pdf_theme_1.FONT_SIZE.small)
            .fillColor(results_pdf_theme_1.COLORS.gray600)
            .text(`${option.count} (${pct}%)`, x + trackWidth + TRACK_TO_COUNT_GAP, cursorY - 1, {
            width: COUNT_LABEL_RESERVED - TRACK_TO_COUNT_GAP,
            align: 'left'
        });
        cursorY += BAR_HEIGHT + BAR_GAP;
    }
    return cursorY;
}
function estimateVerticalBarChartHeight(doc, hasAnswers) {
    if (!hasAnswers) {
        doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.small);
        return doc.currentLineHeight() + BAR_GAP;
    }
    return VERTICAL_CHART_TOP_GAP + VERTICAL_CHART_HEIGHT + VERTICAL_CHART_AXIS_HEIGHT;
}
function drawVerticalBarChart(doc, x, y, width, buckets, lang) {
    const maxCount = Math.max(0, ...buckets.map((b) => b.count));
    if (maxCount === 0) {
        doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.small).fillColor(results_pdf_theme_1.COLORS.gray600);
        doc.text((0, results_pdf_i18n_1.tr)(lang, 'noAnswersYet'), x, y);
        return y + doc.currentLineHeight() + BAR_GAP;
    }
    const chartBottom = y + VERTICAL_CHART_TOP_GAP + VERTICAL_CHART_HEIGHT;
    const n = buckets.length;
    const barWidth = (width / n) * 0.75;
    const gap = (width / n) * 0.25;
    buckets.forEach((bucket, i) => {
        const barX = x + i * (barWidth + gap) + gap / 2;
        if (bucket.count > 0) {
            const barHeight = VERTICAL_CHART_HEIGHT * (bucket.count / maxCount);
            doc.roundedRect(barX, chartBottom - barHeight, barWidth, barHeight, 3).fill(results_pdf_theme_1.COLORS.green600);
            const labelY = chartBottom - barHeight - 12;
            if (labelY >= y) {
                doc
                    .font(results_pdf_theme_1.FONT_FAMILY.regular)
                    .fontSize(results_pdf_theme_1.FONT_SIZE.small)
                    .fillColor(results_pdf_theme_1.COLORS.gray600)
                    .text(String(bucket.count), barX, labelY, { width: barWidth, align: 'center' });
            }
        }
        doc
            .font(results_pdf_theme_1.FONT_FAMILY.regular)
            .fontSize(results_pdf_theme_1.FONT_SIZE.small)
            .fillColor(results_pdf_theme_1.COLORS.gray600)
            .text(String(bucket.value), barX, chartBottom + 4, { width: barWidth, align: 'center' });
    });
    return chartBottom + 4 + VERTICAL_CHART_AXIS_HEIGHT;
}
//# sourceMappingURL=results-pdf.charts.js.map