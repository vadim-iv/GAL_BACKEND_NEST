import { ApprovalStatusEnum } from 'src/enums/status.enum';
import { DecisionStatusEnum } from 'src/enums/decision-status.enum';
import { ResultsPdfLang } from './results-pdf.i18n';
export declare function createDocument(): PDFKit.PDFDocument;
export declare function registerFonts(doc: PDFKit.PDFDocument): void;
export declare function drawHeader(doc: PDFKit.PDFDocument): void;
export declare function drawFooter(doc: PDFKit.PDFDocument, pageIndex: number, totalPages: number, lang: ResultsPdfLang): void;
export declare function ensureSpace(doc: PDFKit.PDFDocument, requiredHeight: number): void;
export declare function drawCard(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number): void;
export declare function measureStatTileHeight(doc: PDFKit.PDFDocument, width: number, label: string, value: string, secondaryValue?: string): number;
export declare function drawStatTile(doc: PDFKit.PDFDocument, x: number, y: number, width: number, label: string, value: string, secondaryValue?: string): number;
export declare function measureStatusPillWidth(doc: PDFKit.PDFDocument, status: ApprovalStatusEnum, lang: ResultsPdfLang): number;
export declare function drawStatusPill(doc: PDFKit.PDFDocument, x: number, y: number, status: ApprovalStatusEnum, lang: ResultsPdfLang): {
    width: number;
    bottom: number;
};
export declare function measureDecisionStatusPillWidth(doc: PDFKit.PDFDocument, status: DecisionStatusEnum, lang: ResultsPdfLang): number;
export declare function drawDecisionStatusPill(doc: PDFKit.PDFDocument, x: number, y: number, status: DecisionStatusEnum, lang: ResultsPdfLang): {
    width: number;
    bottom: number;
};
export declare function formatDate(date: Date): string;
