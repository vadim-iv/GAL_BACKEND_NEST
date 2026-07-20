export declare const HTML_ENTITIES: Record<string, string>;
export declare function decodeHtmlEntities(text: string): string;
export interface RichTextRun {
    text: string;
    bold?: boolean;
    underline?: boolean;
    strike?: boolean;
    sub?: boolean;
    sup?: boolean;
    isBreak?: boolean;
}
export type RichTextBlockType = 'paragraph' | 'bullet-item' | 'ordered-item';
export interface RichTextBlock {
    type: RichTextBlockType;
    runs: RichTextRun[];
    number?: number;
}
export declare function parseRichText(html: string): RichTextBlock[];
export declare function appendPlainTextRun(blocks: RichTextBlock[], text: string): RichTextBlock[];
export declare function measureRichTextHeight(doc: PDFKit.PDFDocument, blocks: RichTextBlock[], width: number, baseFontSize: number): number;
export declare function drawRichText(doc: PDFKit.PDFDocument, blocks: RichTextBlock[], x: number, y: number, width: number, baseFontSize: number, color: string): void;
