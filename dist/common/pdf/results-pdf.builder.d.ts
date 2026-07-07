import { LocalCallDocument } from 'src/schemas/local_call.schema';
import { DecisionDocument } from 'src/schemas/decision.schema';
export type ResultsPdfLang = 'ro' | 'ru' | 'en';
export declare function buildLocalCallResultsPdf(localCall: LocalCallDocument, lang?: ResultsPdfLang): Promise<Buffer>;
export declare function buildDecisionResultsPdf(decision: DecisionDocument, lang?: ResultsPdfLang): Promise<Buffer>;
