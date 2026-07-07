"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const management_schema_1 = require("../schemas/management.schema");
const member_schema_1 = require("../schemas/member.schema");
const member_enum_1 = require("../enums/member.enum");
const LANGS = ['ro', 'ru', 'en'];
let ManagementService = class ManagementService {
    managementModel;
    memberModel;
    constructor(managementModel, memberModel) {
        this.managementModel = managementModel;
        this.memberModel = memberModel;
    }
    async getManagement() {
        const management = await this.managementModel.findOne().exec();
        if (!management) {
            throw new common_1.NotFoundException('Management not found');
        }
        return management.toObject();
    }
    async updateMainImage(main_image) {
        const management = await this.managementModel
            .findOneAndUpdate({}, { $set: { main_image } }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true })
            .exec();
        return management.toObject();
    }
    async syncFromMembers() {
        const members = await this.memberModel.find().exec();
        const byRole = (role) => members.filter((m) => m.role === role).sort((a, b) => a.name.ro.localeCompare(b.name.ro));
        const allMembersSorted = [...members].sort((a, b) => a.name.ro.localeCompare(b.name.ro));
        const president = this.buildPresident(byRole(member_enum_1.MemberRolesEnum.PRESIDENT)[0]);
        const executive = this.buildColumns(byRole(member_enum_1.MemberRolesEnum.EXECUTIVE_BODY));
        const administration = this.buildColumns(byRole(member_enum_1.MemberRolesEnum.ADMINISTRATION));
        const committee = this.buildColumns(byRole(member_enum_1.MemberRolesEnum.SELECTION_COMMITTEE));
        const censorship = this.buildColumns(byRole(member_enum_1.MemberRolesEnum.CENSORSHIP_COMMITTEE));
        const general_assembly = this.buildColumns(allMembersSorted);
        await this.managementModel
            .findOneAndUpdate({}, { $set: { president, executive, administration, committee, censorship, general_assembly } }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true })
            .exec();
    }
    async search(query, limit = 10) {
        const pipeline = [
            {
                $search: {
                    index: 'default-management',
                    compound: {
                        should: [
                            { autocomplete: { query: query, path: 'president.text.ro', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'president.text.en', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'president.text.ru', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'executive.column1.ro', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'executive.column1.en', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'executive.column1.ru', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'executive.column2.ro', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'executive.column2.en', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'executive.column2.ru', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'general_assembly.column1.ro', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'general_assembly.column1.en', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'general_assembly.column1.ru', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'general_assembly.column2.ro', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'general_assembly.column2.en', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'general_assembly.column2.ru', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'administration.column1.ro', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'administration.column1.en', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'administration.column1.ru', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'administration.column2.ro', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'administration.column2.en', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'administration.column2.ru', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'committee.column1.ro', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'committee.column1.en', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'committee.column1.ru', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'committee.column2.ro', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'committee.column2.en', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'committee.column2.ru', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'censorship.column1.ro', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'censorship.column1.en', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'censorship.column1.ru', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'censorship.column2.ro', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'censorship.column2.en', fuzzy: { prefixLength: 5 } } },
                            { autocomplete: { query: query, path: 'censorship.column2.ru', fuzzy: { prefixLength: 5 } } }
                        ]
                    }
                }
            },
            { $limit: limit }
        ];
        return this.managementModel.aggregate(pipeline).exec();
    }
    formatMemberLine(member, lang) {
        return `<p><strong>${member.name[lang]}</strong>, ${member.details[lang]}</p>`;
    }
    buildPresident(member) {
        if (!member) {
            return { text: this.emptyMultiLangText(), image: '' };
        }
        const text = this.buildMultiLangText((lang) => this.formatMemberLine(member, lang));
        return { text, image: member.imageUrl || '' };
    }
    buildColumns(members) {
        const mid = Math.ceil(members.length / 2);
        const firstHalf = members.slice(0, mid);
        const secondHalf = members.slice(mid);
        const column1 = this.buildMultiLangText((lang) => firstHalf.map((m) => this.formatMemberLine(m, lang)).join(''));
        const column2 = this.buildMultiLangText((lang) => secondHalf.map((m) => this.formatMemberLine(m, lang)).join(''));
        return { column1, column2 };
    }
    buildMultiLangText(build) {
        return LANGS.reduce((acc, lang) => ({ ...acc, [lang]: build(lang) }), {});
    }
    emptyMultiLangText() {
        return { ro: '', ru: '', en: '' };
    }
};
exports.ManagementService = ManagementService;
exports.ManagementService = ManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(management_schema_1.Management.name)),
    __param(1, (0, mongoose_1.InjectModel)(member_schema_1.Member.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ManagementService);
//# sourceMappingURL=management.service.js.map