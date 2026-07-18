import { ResultsPdfLang } from './results-pdf.i18n';
export declare function truncateToLines(doc: PDFKit.PDFDocument, text: string, width: number, maxLines: number): string;
export interface BarChartOption {
    label: string;
    count: number;
}
export declare function estimateHorizontalBarChartHeight(doc: PDFKit.PDFDocument, width: number, options: BarChartOption[], totalRespondents: number): number;
export declare function drawHorizontalBarChart(doc: PDFKit.PDFDocument, x: number, y: number, width: number, options: BarChartOption[], totalRespondents: number, lang: ResultsPdfLang): number;
export interface ScoreBucket {
    value: number;
    count: number;
}
export declare function estimateVerticalBarChartHeight(doc: PDFKit.PDFDocument, hasAnswers: boolean): number;
export declare function drawVerticalBarChart(doc: PDFKit.PDFDocument, x: number, y: number, width: number, buckets: ScoreBucket[], lang: ResultsPdfLang): number;
