import { LocalCallDocument, Project } from 'src/schemas/local_call.schema';
import { DecisionDocument } from 'src/schemas/decision.schema';
import { ResultsPdfLang } from './results-pdf.i18n';
export { ResultsPdfLang } from './results-pdf.i18n';
export declare function buildDecisionResultsPdf(decision: DecisionDocument, lang?: ResultsPdfLang): Promise<Buffer>;
export declare function buildProjectResultsPdf(localCall: LocalCallDocument, project: Project, lang?: ResultsPdfLang): Promise<Buffer>;
