"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDecisionResultsPdf = buildDecisionResultsPdf;
exports.buildProjectResultsPdf = buildProjectResultsPdf;
const decision_enum_1 = require("../../enums/decision.enum");
const results_pdf_layout_1 = require("./results-pdf.layout");
const results_pdf_charts_1 = require("./results-pdf.charts");
const results_pdf_i18n_1 = require("./results-pdf.i18n");
const results_pdf_richtext_1 = require("./results-pdf.richtext");
const results_pdf_theme_1 = require("./results-pdf.theme");
function getMemberIdString(memberId) {
    if (!memberId)
        return null;
    if (typeof memberId === 'object' && '_id' in memberId) {
        return memberId._id.toString();
    }
    return memberId.toString();
}
function countDeletedVoters(perQuestionAnswers) {
    return Math.max(0, ...perQuestionAnswers.map((answers) => answers.filter((a) => !a.memberId).length));
}
function getDeletedVotersNote(deletedVoters, lang) {
    if (deletedVoters === 0)
        return undefined;
    const word = (0, results_pdf_i18n_1.tr)(lang, deletedVoters === 1 ? 'deletedMemberSingular' : 'deletedMemberPlural');
    return `(${(0, results_pdf_i18n_1.tr)(lang, 'and')} ${deletedVoters} ${word})`;
}
function calculateAverageMark(questions, answers) {
    if (!answers || answers.length === 0)
        return 0;
    const normalized = answers.map((a) => {
        const question = questions.find((q) => q._id.toString() === a.questionId.toString());
        const maxScore = question?.maxScore || 10;
        return (a.answer / maxScore) * 10;
    });
    return normalized.reduce((acc, val) => acc + val, 0) / normalized.length;
}
function contentWidth(doc) {
    return doc.page.width - results_pdf_theme_1.PAGE.margins.left - results_pdf_theme_1.PAGE.margins.right;
}
function stripHtml(html) {
    return html
        .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&[a-z#0-9]+;/gi, (entity) => results_pdf_richtext_1.HTML_ENTITIES[entity.toLowerCase()] ?? entity)
        .replace(/\n{2,}/g, '\n')
        .trim();
}
function renderToBuffer(lang, render) {
    return new Promise((resolve, reject) => {
        const doc = (0, results_pdf_layout_1.createDocument)();
        (0, results_pdf_layout_1.registerFonts)(doc);
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        doc.on('pageAdded', () => (0, results_pdf_layout_1.drawHeader)(doc));
        (0, results_pdf_layout_1.drawHeader)(doc);
        render(doc);
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            (0, results_pdf_layout_1.drawFooter)(doc, i, range.count, lang);
        }
        doc.end();
    });
}
function drawTitleBlock(doc, x, width, title, subtitle) {
    if (subtitle) {
        doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.body).fillColor(results_pdf_theme_1.COLORS.gray600).text(subtitle, x, doc.y, { width });
        doc.moveDown(0.2);
    }
    doc.font(results_pdf_theme_1.FONT_FAMILY.semiBold).fontSize(results_pdf_theme_1.FONT_SIZE.title).fillColor(results_pdf_theme_1.COLORS.green700).text(title, x, doc.y, { width });
    doc.moveDown(0.6);
}
async function buildDecisionResultsPdf(decision, lang = 'ro') {
    const title = (0, results_pdf_i18n_1.t)(decision.title, lang);
    return renderToBuffer(lang, (doc) => {
        const x = results_pdf_theme_1.PAGE.margins.left;
        const width = contentWidth(doc);
        drawTitleBlock(doc, x, width, title);
        const description = stripHtml((0, results_pdf_i18n_1.t)(decision.description, lang));
        if (description) {
            doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.body).fillColor(results_pdf_theme_1.COLORS.gray700).text(description, x, doc.y, { width });
            doc.y += 16;
        }
        const totalVoters = new Set(decision.questions
            .flatMap((q) => (q.answers || []).map((a) => getMemberIdString(a.memberId)))
            .filter((id) => id !== null)).size;
        const deletedVoters = countDeletedVoters(decision.questions.map((q) => q.answers || []));
        const deletedVotersNote = getDeletedVotersNote(deletedVoters, lang);
        const statTop = doc.y;
        const statGap = 16;
        const pillWidth = (0, results_pdf_layout_1.measureDecisionStatusPillWidth)(doc, decision.status, lang);
        const tileWidth = (width - pillWidth - statGap * 2) / 2;
        const voteWindowText = `${(0, results_pdf_layout_1.formatDate)(decision.voteStart)} - ${(0, results_pdf_layout_1.formatDate)(decision.voteEnd)}`;
        const voteWindowLabel = (0, results_pdf_i18n_1.tr)(lang, 'voteWindow');
        const totalVotersLabel = (0, results_pdf_i18n_1.tr)(lang, 'totalVoters');
        const rowHeight = Math.max(results_pdf_theme_1.STATUS_PILL_HEIGHT, (0, results_pdf_layout_1.measureStatTileHeight)(doc, tileWidth, voteWindowLabel, voteWindowText), (0, results_pdf_layout_1.measureStatTileHeight)(doc, tileWidth, totalVotersLabel, String(totalVoters), deletedVotersNote));
        const pill = (0, results_pdf_layout_1.drawDecisionStatusPill)(doc, x, statTop + (rowHeight - results_pdf_theme_1.STATUS_PILL_HEIGHT) / 2, decision.status, lang);
        const tile1Bottom = (0, results_pdf_layout_1.drawStatTile)(doc, x + pillWidth + statGap, statTop, tileWidth, voteWindowLabel, voteWindowText);
        const tile2Bottom = (0, results_pdf_layout_1.drawStatTile)(doc, x + pillWidth + statGap + tileWidth + statGap, statTop, tileWidth, totalVotersLabel, String(totalVoters), deletedVotersNote);
        doc.y = Math.max(pill.bottom, tile1Bottom, tile2Bottom) + 24;
        for (const question of decision.questions) {
            renderDecisionQuestion(doc, question, x, width, lang);
        }
    });
}
function renderDecisionQuestion(doc, question, x, width, lang) {
    const innerX = x + results_pdf_theme_1.SPACING.cardPadding;
    const innerWidth = width - results_pdf_theme_1.SPACING.cardPadding * 2;
    const questionBlocks = (0, results_pdf_richtext_1.parseRichText)((0, results_pdf_i18n_1.t)(question.question, lang));
    const labelHeight = (0, results_pdf_richtext_1.measureRichTextHeight)(doc, questionBlocks, innerWidth, results_pdf_theme_1.FONT_SIZE.sectionLabel);
    const isChoice = question.type === decision_enum_1.DecisionQuestionType.RADIO || question.type === decision_enum_1.DecisionQuestionType.CHECKBOX;
    const answers = question.answers || [];
    let options = [];
    let textAnswers = [];
    let bodyHeight = 0;
    if (isChoice) {
        const tally = new Map();
        for (const option of question.options || [])
            tally.set(option.value, 0);
        for (const answer of answers) {
            const selected = question.type === decision_enum_1.DecisionQuestionType.CHECKBOX ? answer.values || [] : [answer.value];
            for (const value of selected) {
                if (!value)
                    continue;
                tally.set(value, (tally.get(value) || 0) + 1);
            }
        }
        options = (question.options || []).map((o) => ({
            label: (0, results_pdf_i18n_1.t)(o.label, lang),
            count: tally.get(o.value) || 0
        }));
        bodyHeight = (0, results_pdf_charts_1.estimateHorizontalBarChartHeight)(doc, innerWidth, options, answers.length);
    }
    else {
        textAnswers = answers.map((a) => a.value || '');
        doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.small);
        bodyHeight =
            textAnswers.length === 0
                ? doc.currentLineHeight()
                : textAnswers.reduce((sum, ans) => sum + doc.heightOfString(`•  ${ans}`, { width: innerWidth }) + 4, 0);
    }
    const cardHeight = results_pdf_theme_1.SPACING.cardPadding * 2 + labelHeight + 10 + bodyHeight;
    (0, results_pdf_layout_1.ensureSpace)(doc, cardHeight + results_pdf_theme_1.SPACING.cardGap);
    const cardTop = doc.y;
    (0, results_pdf_layout_1.drawCard)(doc, x, cardTop, width, cardHeight);
    (0, results_pdf_richtext_1.drawRichText)(doc, questionBlocks, innerX, cardTop + results_pdf_theme_1.SPACING.cardPadding, innerWidth, results_pdf_theme_1.FONT_SIZE.sectionLabel, results_pdf_theme_1.COLORS.green700);
    const bodyTop = cardTop + results_pdf_theme_1.SPACING.cardPadding + labelHeight + 10;
    if (isChoice) {
        (0, results_pdf_charts_1.drawHorizontalBarChart)(doc, innerX, bodyTop, innerWidth, options, answers.length, lang);
    }
    else if (textAnswers.length === 0) {
        doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.small).fillColor(results_pdf_theme_1.COLORS.gray600).text((0, results_pdf_i18n_1.tr)(lang, 'noResponsesYet'), innerX, bodyTop);
    }
    else {
        doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.small).fillColor(results_pdf_theme_1.COLORS.gray700);
        let cursorY = bodyTop;
        for (const ans of textAnswers) {
            doc.text(`•  ${ans}`, innerX, cursorY, { width: innerWidth });
            cursorY += doc.heightOfString(`•  ${ans}`, { width: innerWidth }) + 4;
        }
    }
    doc.y = cardTop + cardHeight + results_pdf_theme_1.SPACING.cardGap;
}
async function buildProjectResultsPdf(localCall, project, lang = 'ro') {
    const title = (0, results_pdf_i18n_1.t)(project.title, lang);
    const subtitle = (0, results_pdf_i18n_1.t)(localCall.name, lang);
    return renderToBuffer(lang, (doc) => {
        const x = results_pdf_theme_1.PAGE.margins.left;
        const width = contentWidth(doc);
        drawTitleBlock(doc, x, width, title, subtitle);
        const totalVoters = new Set((project.answers || [])
            .map((a) => getMemberIdString(a.memberId))
            .filter((id) => id !== null)).size;
        const answersByQuestion = new Map();
        for (const answer of project.answers || []) {
            const key = answer.questionId.toString();
            answersByQuestion.set(key, [...(answersByQuestion.get(key) || []), answer]);
        }
        const deletedVoters = countDeletedVoters([...answersByQuestion.values()]);
        const deletedVotersNote = getDeletedVotersNote(deletedVoters, lang);
        const averageMark = calculateAverageMark(localCall.questions, project.answers);
        const statTop = doc.y;
        const statGap = 16;
        const pillWidth = (0, results_pdf_layout_1.measureStatusPillWidth)(doc, project.status, lang);
        const tileWidth = (width - pillWidth - statGap * 2) / 2;
        const averageScoreLabel = (0, results_pdf_i18n_1.tr)(lang, 'averageScore');
        const averageScoreValue = `${averageMark.toFixed(2)} / 10`;
        const totalVotersLabel = (0, results_pdf_i18n_1.tr)(lang, 'totalVoters');
        const rowHeight = Math.max(results_pdf_theme_1.STATUS_PILL_HEIGHT, (0, results_pdf_layout_1.measureStatTileHeight)(doc, tileWidth, averageScoreLabel, averageScoreValue), (0, results_pdf_layout_1.measureStatTileHeight)(doc, tileWidth, totalVotersLabel, String(totalVoters), deletedVotersNote));
        const pill = (0, results_pdf_layout_1.drawStatusPill)(doc, x, statTop + (rowHeight - results_pdf_theme_1.STATUS_PILL_HEIGHT) / 2, project.status, lang);
        const tile1Bottom = (0, results_pdf_layout_1.drawStatTile)(doc, x + pillWidth + statGap, statTop, tileWidth, averageScoreLabel, averageScoreValue);
        const tile2Bottom = (0, results_pdf_layout_1.drawStatTile)(doc, x + pillWidth + statGap + tileWidth + statGap, statTop, tileWidth, totalVotersLabel, String(totalVoters), deletedVotersNote);
        doc.y = Math.max(pill.bottom, tile1Bottom, tile2Bottom) + 24;
        for (const question of localCall.questions) {
            renderProjectQuestion(doc, question, project, x, width, lang);
        }
    });
}
function renderProjectQuestion(doc, question, project, x, width, lang) {
    const innerX = x + results_pdf_theme_1.SPACING.cardPadding;
    const innerWidth = width - results_pdf_theme_1.SPACING.cardPadding * 2;
    const questionBlocks = (0, results_pdf_richtext_1.parseRichText)((0, results_pdf_i18n_1.t)(question.question, lang));
    const labelHeight = (0, results_pdf_richtext_1.measureRichTextHeight)(doc, questionBlocks, innerWidth, results_pdf_theme_1.FONT_SIZE.sectionLabel);
    const questionAnswers = (project.answers || []).filter((a) => a.questionId.toString() === question._id.toString());
    const buckets = Array.from({ length: question.maxScore + 1 }, (_, value) => ({
        value,
        count: questionAnswers.filter((a) => a.answer === value).length
    }));
    const bodyHeight = (0, results_pdf_charts_1.estimateVerticalBarChartHeight)(doc, questionAnswers.length > 0);
    const cardHeight = results_pdf_theme_1.SPACING.cardPadding * 2 + labelHeight + 10 + bodyHeight;
    (0, results_pdf_layout_1.ensureSpace)(doc, cardHeight + results_pdf_theme_1.SPACING.cardGap);
    const cardTop = doc.y;
    (0, results_pdf_layout_1.drawCard)(doc, x, cardTop, width, cardHeight);
    (0, results_pdf_richtext_1.drawRichText)(doc, questionBlocks, innerX, cardTop + results_pdf_theme_1.SPACING.cardPadding, innerWidth, results_pdf_theme_1.FONT_SIZE.sectionLabel, results_pdf_theme_1.COLORS.green700);
    if (questionAnswers.length > 0) {
        const mean = questionAnswers.reduce((sum, a) => sum + a.answer, 0) / questionAnswers.length;
        doc
            .font(results_pdf_theme_1.FONT_FAMILY.semiBold)
            .fontSize(results_pdf_theme_1.FONT_SIZE.body)
            .fillColor(results_pdf_theme_1.COLORS.green600)
            .text(`${mean.toFixed(1)} / ${question.maxScore}`, innerX, cardTop + results_pdf_theme_1.SPACING.cardPadding, {
            width: innerWidth,
            align: 'right'
        });
    }
    const bodyTop = cardTop + results_pdf_theme_1.SPACING.cardPadding + labelHeight + 10;
    (0, results_pdf_charts_1.drawVerticalBarChart)(doc, innerX, bodyTop, innerWidth, buckets, lang);
    doc.y = cardTop + cardHeight + results_pdf_theme_1.SPACING.cardGap;
}
//# sourceMappingURL=results-pdf.builder.js.map