"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocument = createDocument;
exports.registerFonts = registerFonts;
exports.drawHeader = drawHeader;
exports.drawFooter = drawFooter;
exports.ensureSpace = ensureSpace;
exports.drawCard = drawCard;
exports.measureStatTileHeight = measureStatTileHeight;
exports.drawStatTile = drawStatTile;
exports.measureStatusPillWidth = measureStatusPillWidth;
exports.drawStatusPill = drawStatusPill;
exports.measureDecisionStatusPillWidth = measureDecisionStatusPillWidth;
exports.drawDecisionStatusPill = drawDecisionStatusPill;
exports.formatDate = formatDate;
const PDFDocument = require("pdfkit");
const fs = require("fs");
const SVGtoPDF = require("svg-to-pdfkit");
const status_enum_1 = require("../../enums/status.enum");
const decision_status_enum_1 = require("../../enums/decision-status.enum");
const results_pdf_theme_1 = require("./results-pdf.theme");
const results_pdf_i18n_1 = require("./results-pdf.i18n");
const LOGO_SVG = fs.readFileSync(results_pdf_theme_1.LOGO_SVG_PATH, 'utf-8');
const HEADER_LOGO_SIZE = 24;
const HEADER_TOP = 30;
const STAT_TILE_HEIGHT = 44;
const STAT_TILE_PADDING = 10;
const ORGANIZATION_NAME = 'GAL Stejarul Dacilor';
function createDocument() {
    return new PDFDocument({ size: results_pdf_theme_1.PAGE.size, margins: results_pdf_theme_1.PAGE.margins, bufferPages: true });
}
function registerFonts(doc) {
    doc.registerFont(results_pdf_theme_1.FONT_FAMILY.regular, results_pdf_theme_1.FONT_PATHS.regular);
    doc.registerFont(results_pdf_theme_1.FONT_FAMILY.semiBold, results_pdf_theme_1.FONT_PATHS.semiBold);
}
function drawHeader(doc) {
    const x = results_pdf_theme_1.PAGE.margins.left;
    const y = HEADER_TOP;
    SVGtoPDF(doc, LOGO_SVG, x, y, {
        width: HEADER_LOGO_SIZE,
        height: HEADER_LOGO_SIZE,
        preserveAspectRatio: 'xMidYMid meet'
    });
    doc
        .font(results_pdf_theme_1.FONT_FAMILY.semiBold)
        .fontSize(results_pdf_theme_1.FONT_SIZE.subtitle)
        .fillColor(results_pdf_theme_1.COLORS.green700)
        .text(ORGANIZATION_NAME, x + HEADER_LOGO_SIZE + 10, y + HEADER_LOGO_SIZE / 2 - 6, {
        width: doc.page.width - results_pdf_theme_1.PAGE.margins.left - results_pdf_theme_1.PAGE.margins.right - HEADER_LOGO_SIZE - 10,
        height: doc.currentLineHeight(),
        ellipsis: true
    });
    const ruleY = y + HEADER_LOGO_SIZE + 10;
    doc
        .moveTo(x, ruleY)
        .lineTo(doc.page.width - results_pdf_theme_1.PAGE.margins.right, ruleY)
        .lineWidth(1)
        .strokeColor(results_pdf_theme_1.COLORS.green500)
        .stroke();
    doc.x = results_pdf_theme_1.PAGE.margins.left;
    doc.y = results_pdf_theme_1.PAGE.margins.top;
}
function drawFooter(doc, pageIndex, totalPages, lang) {
    const y = doc.page.height - results_pdf_theme_1.PAGE.margins.bottom + 20;
    const generatedText = `${(0, results_pdf_i18n_1.tr)(lang, 'generatedOn')} ${formatDate(new Date())}`;
    const pageText = `${(0, results_pdf_i18n_1.tr)(lang, 'page')} ${pageIndex + 1} / ${totalPages}`;
    const originalBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.footer).fillColor(results_pdf_theme_1.COLORS.gray600);
    doc.text(generatedText, results_pdf_theme_1.PAGE.margins.left, y, { width: 250, align: 'left', lineBreak: false });
    doc.text(pageText, doc.page.width - results_pdf_theme_1.PAGE.margins.right - 150, y, { width: 150, align: 'right', lineBreak: false });
    doc.page.margins.bottom = originalBottomMargin;
}
function ensureSpace(doc, requiredHeight) {
    const bottom = doc.page.height - results_pdf_theme_1.PAGE.margins.bottom;
    if (doc.y + requiredHeight > bottom) {
        doc.addPage();
    }
}
function drawCard(doc, x, y, width, height) {
    doc
        .roundedRect(x, y, width, height, results_pdf_theme_1.SPACING.cardRadius)
        .lineWidth(1)
        .fillAndStroke(results_pdf_theme_1.COLORS.white, results_pdf_theme_1.COLORS.gray500);
}
const STAT_TILE_TOP_PAD = 8;
const STAT_TILE_LABEL_VALUE_GAP = 5;
const STAT_TILE_BOTTOM_PAD = 8;
const STAT_TILE_VALUE_SECONDARY_GAP = 4;
function fontBaselineOffset(doc) {
    const internal = doc;
    return (internal._font.ascender / 1000) * internal._fontSize;
}
function secondaryValueFitsInline(doc, innerWidth, value, secondaryValue) {
    doc.font(results_pdf_theme_1.FONT_FAMILY.semiBold).fontSize(results_pdf_theme_1.FONT_SIZE.statValue);
    const valueWidth = doc.widthOfString(value);
    doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.statValueSecondary);
    const secondaryWidth = doc.widthOfString(secondaryValue);
    return valueWidth + STAT_TILE_VALUE_SECONDARY_GAP + secondaryWidth <= innerWidth;
}
function measureStatTileHeight(doc, width, label, value, secondaryValue) {
    const innerWidth = width - STAT_TILE_PADDING * 2;
    doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.statLabel);
    const labelHeight = doc.heightOfString(label, { width: innerWidth });
    doc.font(results_pdf_theme_1.FONT_FAMILY.semiBold).fontSize(results_pdf_theme_1.FONT_SIZE.statValue);
    const valueHeight = doc.heightOfString(value, { width: innerWidth });
    let wrappedSecondaryHeight = 0;
    if (secondaryValue && !secondaryValueFitsInline(doc, innerWidth, value, secondaryValue)) {
        doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.statValueSecondary);
        wrappedSecondaryHeight = doc.heightOfString(secondaryValue, { width: innerWidth });
    }
    return Math.max(STAT_TILE_HEIGHT, STAT_TILE_TOP_PAD + labelHeight + STAT_TILE_LABEL_VALUE_GAP + valueHeight + wrappedSecondaryHeight + STAT_TILE_BOTTOM_PAD);
}
function drawStatTile(doc, x, y, width, label, value, secondaryValue) {
    const innerWidth = width - STAT_TILE_PADDING * 2;
    const topPad = STAT_TILE_TOP_PAD;
    const gap = STAT_TILE_LABEL_VALUE_GAP;
    doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.statLabel);
    const labelHeight = doc.heightOfString(label, { width: innerWidth });
    const height = measureStatTileHeight(doc, width, label, value, secondaryValue);
    doc.roundedRect(x, y, width, height, 6).fill(results_pdf_theme_1.COLORS.gray300);
    doc
        .font(results_pdf_theme_1.FONT_FAMILY.regular)
        .fontSize(results_pdf_theme_1.FONT_SIZE.statLabel)
        .fillColor(results_pdf_theme_1.COLORS.gray600)
        .text(label, x + STAT_TILE_PADDING, y + topPad, { width: innerWidth });
    doc.font(results_pdf_theme_1.FONT_FAMILY.semiBold).fontSize(results_pdf_theme_1.FONT_SIZE.statValue);
    const valueY = y + topPad + labelHeight + gap;
    const valueHeight = doc.heightOfString(value, { width: innerWidth });
    doc.fillColor(results_pdf_theme_1.COLORS.green700).text(value, x + STAT_TILE_PADDING, valueY, { width: innerWidth });
    if (secondaryValue) {
        const fitsInline = secondaryValueFitsInline(doc, innerWidth, value, secondaryValue);
        doc.font(results_pdf_theme_1.FONT_FAMILY.semiBold).fontSize(results_pdf_theme_1.FONT_SIZE.statValue);
        const valueWidth = doc.widthOfString(value);
        const valueBaseline = fontBaselineOffset(doc);
        doc.font(results_pdf_theme_1.FONT_FAMILY.regular).fontSize(results_pdf_theme_1.FONT_SIZE.statValueSecondary);
        if (fitsInline) {
            const secondaryBaseline = fontBaselineOffset(doc);
            const secondaryY = valueY + valueBaseline - secondaryBaseline;
            doc
                .fillColor(results_pdf_theme_1.COLORS.errorPale)
                .text(secondaryValue, x + STAT_TILE_PADDING + valueWidth + STAT_TILE_VALUE_SECONDARY_GAP, secondaryY, {
                width: innerWidth - valueWidth - STAT_TILE_VALUE_SECONDARY_GAP
            });
        }
        else {
            doc
                .fillColor(results_pdf_theme_1.COLORS.errorPale)
                .text(secondaryValue, x + STAT_TILE_PADDING, valueY + valueHeight, { width: innerWidth });
        }
    }
    return y + height;
}
const STATUS_COLOR = {
    [status_enum_1.ApprovalStatusEnum.PENDING]: results_pdf_theme_1.COLORS.gray600,
    [status_enum_1.ApprovalStatusEnum.APPROVED]: results_pdf_theme_1.COLORS.green600,
    [status_enum_1.ApprovalStatusEnum.REJECTED]: results_pdf_theme_1.COLORS.error
};
const STATUS_LABEL_KEY = {
    [status_enum_1.ApprovalStatusEnum.PENDING]: 'statusPending',
    [status_enum_1.ApprovalStatusEnum.APPROVED]: 'statusApproved',
    [status_enum_1.ApprovalStatusEnum.REJECTED]: 'statusRejected'
};
function measureStatusPillWidth(doc, status, lang) {
    const label = (0, results_pdf_i18n_1.tr)(lang, STATUS_LABEL_KEY[status]);
    doc.font(results_pdf_theme_1.FONT_FAMILY.semiBold).fontSize(results_pdf_theme_1.FONT_SIZE.small);
    return doc.widthOfString(label) + 20;
}
function drawStatusPill(doc, x, y, status, lang) {
    const label = (0, results_pdf_i18n_1.tr)(lang, STATUS_LABEL_KEY[status]);
    const pillHeight = results_pdf_theme_1.STATUS_PILL_HEIGHT;
    const pillWidth = measureStatusPillWidth(doc, status, lang);
    doc.font(results_pdf_theme_1.FONT_FAMILY.semiBold).fontSize(results_pdf_theme_1.FONT_SIZE.small);
    doc.roundedRect(x, y, pillWidth, pillHeight, pillHeight / 2).fill(STATUS_COLOR[status]);
    doc.fillColor(results_pdf_theme_1.COLORS.white).text(label, x, y + 5, { width: pillWidth, align: 'center' });
    return { width: pillWidth, bottom: y + pillHeight };
}
const DECISION_STATUS_COLOR = {
    [decision_status_enum_1.DecisionStatusEnum.PENDING]: results_pdf_theme_1.COLORS.gray600,
    [decision_status_enum_1.DecisionStatusEnum.CLOSED]: results_pdf_theme_1.COLORS.green600
};
const DECISION_STATUS_LABEL_KEY = {
    [decision_status_enum_1.DecisionStatusEnum.PENDING]: 'statusOpen',
    [decision_status_enum_1.DecisionStatusEnum.CLOSED]: 'statusClosed'
};
function resolveDecisionStatus(status) {
    return status in DECISION_STATUS_COLOR ? status : decision_status_enum_1.DecisionStatusEnum.PENDING;
}
function measureDecisionStatusPillWidth(doc, status, lang) {
    const label = (0, results_pdf_i18n_1.tr)(lang, DECISION_STATUS_LABEL_KEY[resolveDecisionStatus(status)]);
    doc.font(results_pdf_theme_1.FONT_FAMILY.semiBold).fontSize(results_pdf_theme_1.FONT_SIZE.small);
    return doc.widthOfString(label) + 20;
}
function drawDecisionStatusPill(doc, x, y, status, lang) {
    const resolvedStatus = resolveDecisionStatus(status);
    const label = (0, results_pdf_i18n_1.tr)(lang, DECISION_STATUS_LABEL_KEY[resolvedStatus]);
    const pillHeight = results_pdf_theme_1.STATUS_PILL_HEIGHT;
    const pillWidth = measureDecisionStatusPillWidth(doc, status, lang);
    doc.font(results_pdf_theme_1.FONT_FAMILY.semiBold).fontSize(results_pdf_theme_1.FONT_SIZE.small);
    doc.roundedRect(x, y, pillWidth, pillHeight, pillHeight / 2).fill(DECISION_STATUS_COLOR[resolvedStatus]);
    doc.fillColor(results_pdf_theme_1.COLORS.white).text(label, x, y + 5, { width: pillWidth, align: 'center' });
    return { width: pillWidth, bottom: y + pillHeight };
}
function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${date.getFullYear()}`;
}
//# sourceMappingURL=results-pdf.layout.js.map