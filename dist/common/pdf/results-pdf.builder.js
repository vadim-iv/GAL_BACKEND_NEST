"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLocalCallResultsPdf = buildLocalCallResultsPdf;
exports.buildDecisionResultsPdf = buildDecisionResultsPdf;
const PDFDocument = require("pdfkit");
const decision_enum_1 = require("../../enums/decision.enum");
function t(value, lang) {
    if (!value)
        return '';
    return value[lang] || value.ro || '';
}
function renderToBuffer(render) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        render(doc);
        doc.end();
    });
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
async function buildLocalCallResultsPdf(localCall, lang = 'ro') {
    return renderToBuffer((doc) => {
        doc.fontSize(20).text(t(localCall.name, lang), { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(t(localCall.description, lang));
        doc.moveDown(0.5);
        doc
            .fontSize(10)
            .text(`Vote window: ${localCall.voteStart.toISOString()} - ${localCall.voteEnd.toISOString()}`);
        doc.moveDown(1.5);
        for (const project of localCall.projects) {
            const averageMark = calculateAverageMark(localCall.questions, project.answers);
            doc.fontSize(15).text(t(project.title, lang));
            doc.fontSize(10).text(`Status: ${project.status}`);
            doc.fontSize(10).text(`Average mark: ${averageMark.toFixed(2)} / 10`);
            doc.moveDown(0.5);
            for (const question of localCall.questions) {
                const questionAnswers = project.answers.filter((a) => a.questionId.toString() === question._id.toString());
                doc
                    .fontSize(11)
                    .text(`${t(question.question, lang)} (max ${question.maxScore})`, { indent: 20 });
                if (questionAnswers.length === 0) {
                    doc.fontSize(9).text('No answers yet', { indent: 30 });
                }
                else {
                    for (const answer of questionAnswers) {
                        const member = answer.memberId;
                        const memberLabel = member?.name ? t(member.name, lang) : member?.email || 'Unknown member';
                        doc.fontSize(9).text(`${memberLabel}: ${answer.answer}`, { indent: 30 });
                    }
                }
                doc.moveDown(0.3);
            }
            doc.moveDown(1);
        }
    });
}
async function buildDecisionResultsPdf(decision, lang = 'ro') {
    return renderToBuffer((doc) => {
        doc.fontSize(20).text(t(decision.title, lang), { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(t(decision.description, lang));
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Status: ${decision.status}`);
        doc
            .fontSize(10)
            .text(`Vote window: ${decision.voteStart.toISOString()} - ${decision.voteEnd.toISOString()}`);
        doc.moveDown(1.5);
        for (const question of decision.questions) {
            doc.fontSize(13).text(t(question.question, lang));
            doc.fontSize(9).text(`Type: ${question.type}`, { indent: 20 });
            if (question.type === decision_enum_1.DecisionQuestionType.RADIO || question.type === decision_enum_1.DecisionQuestionType.SELECT) {
                const tally = new Map();
                for (const option of question.options || []) {
                    tally.set(option.value, 0);
                }
                for (const answer of question.answers || []) {
                    tally.set(answer.value, (tally.get(answer.value) || 0) + 1);
                }
                for (const option of question.options || []) {
                    const label = t(option.label, lang);
                    doc.fontSize(9).text(`${label}: ${tally.get(option.value) || 0} vote(s)`, { indent: 30 });
                }
            }
            else {
                if (!question.answers || question.answers.length === 0) {
                    doc.fontSize(9).text('No answers yet', { indent: 30 });
                }
                else {
                    for (const answer of question.answers) {
                        const member = answer.memberId;
                        const memberLabel = member?.name ? t(member.name, lang) : member?.email || 'Unknown member';
                        doc.fontSize(9).text(`${memberLabel}: ${answer.value}`, { indent: 30 });
                    }
                }
            }
            doc.moveDown(0.7);
        }
    });
}
//# sourceMappingURL=results-pdf.builder.js.map