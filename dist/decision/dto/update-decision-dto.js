"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDecisionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const decision_dto_1 = require("./decision.dto");
class UpdateDecisionDto extends (0, mapped_types_1.PartialType)(decision_dto_1.DecisionDto) {
}
exports.UpdateDecisionDto = UpdateDecisionDto;
//# sourceMappingURL=update-decision-dto.js.map