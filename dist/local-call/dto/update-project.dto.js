"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const project_dto_1 = require("./project.dto");
class UpdateProjectDto extends (0, mapped_types_1.PartialType)(project_dto_1.ProjectDto) {
}
exports.UpdateProjectDto = UpdateProjectDto;
//# sourceMappingURL=update-project.dto.js.map