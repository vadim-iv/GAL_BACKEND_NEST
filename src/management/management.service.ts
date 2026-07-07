import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
	Administration,
	Censorship,
	Committee,
	Executive,
	GeneralAssembly,
	Management,
	ManagementDocument,
	President
} from 'src/schemas/management.schema'
import { Member, TMember } from 'src/schemas/member.schema'
import { MemberRolesEnum } from 'src/enums/member.enum'
import { MultiLangText } from 'src/schemas/shared/text.schema'

type Lang = keyof MultiLangText

const LANGS: Lang[] = ['ro', 'ru', 'en']

@Injectable()
export class ManagementService {
	constructor(
		@InjectModel(Management.name) private managementModel: Model<ManagementDocument>,
		@InjectModel(Member.name) private memberModel: Model<TMember>
	) {}

	async getManagement() {
		const management = await this.managementModel.findOne().exec()

		if (!management) {
			throw new NotFoundException('Management not found')
		}

		return management.toObject()
	}

	async updateMainImage(main_image: string) {
		const management = await this.managementModel
			.findOneAndUpdate(
				{},
				{ $set: { main_image } },
				{ new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
			)
			.exec()

		return management.toObject()
	}

	// Recomputes every member-derived section of the singleton management document
	// from the current members collection. main_image is left untouched.
	async syncFromMembers() {
		const members = await this.memberModel.find().exec()

		const byRole = (role: MemberRolesEnum) =>
			members.filter((m) => m.role === role).sort((a, b) => a.name.ro.localeCompare(b.name.ro))

		const allMembersSorted = [...members].sort((a, b) => a.name.ro.localeCompare(b.name.ro))

		const president: President = this.buildPresident(byRole(MemberRolesEnum.PRESIDENT)[0])
		const executive: Executive = this.buildColumns(byRole(MemberRolesEnum.EXECUTIVE_BODY))
		const administration: Administration = this.buildColumns(byRole(MemberRolesEnum.ADMINISTRATION))
		const committee: Committee = this.buildColumns(byRole(MemberRolesEnum.SELECTION_COMMITTEE))
		const censorship: Censorship = this.buildColumns(byRole(MemberRolesEnum.CENSORSHIP_COMMITTEE))
		const general_assembly: GeneralAssembly = this.buildColumns(allMembersSorted)

		await this.managementModel
			.findOneAndUpdate(
				{},
				{ $set: { president, executive, administration, committee, censorship, general_assembly } },
				{ upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
			)
			.exec()
	}

	async search(query: string, limit = 10) {
		const pipeline = [
			{
				$search: {
					index: 'default-management',
					compound: {
						should: [
							// President
							{ autocomplete: { query: query, path: 'president.text.ro', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'president.text.en', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'president.text.ru', fuzzy: {prefixLength: 5} } },
							// Executive
							{ autocomplete: { query: query, path: 'executive.column1.ro', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'executive.column1.en', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'executive.column1.ru', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'executive.column2.ro', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'executive.column2.en', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'executive.column2.ru', fuzzy: {prefixLength: 5} } },
							// General Assembly
							{ autocomplete: { query: query, path: 'general_assembly.column1.ro', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'general_assembly.column1.en', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'general_assembly.column1.ru', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'general_assembly.column2.ro', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'general_assembly.column2.en', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'general_assembly.column2.ru', fuzzy: {prefixLength: 5} } },
							// Administration
							{ autocomplete: { query: query, path: 'administration.column1.ro', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'administration.column1.en', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'administration.column1.ru', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'administration.column2.ro', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'administration.column2.en', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'administration.column2.ru', fuzzy: {prefixLength: 5} } },
							// Committee
							{ autocomplete: { query: query, path: 'committee.column1.ro', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'committee.column1.en', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'committee.column1.ru', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'committee.column2.ro', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'committee.column2.en', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'committee.column2.ru', fuzzy: {prefixLength: 5} } },
							// Censorship
							{ autocomplete: { query: query, path: 'censorship.column1.ro', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'censorship.column1.en', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'censorship.column1.ru', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'censorship.column2.ro', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'censorship.column2.en', fuzzy: {prefixLength: 5} } },
							{ autocomplete: { query: query, path: 'censorship.column2.ru', fuzzy: {prefixLength: 5} } }
						]
					}
				}
			},
			{ $limit: limit }
		]

		return this.managementModel.aggregate(pipeline).exec()
	}

	private formatMemberLine(member: TMember, lang: Lang): string {
		return `<p><strong>${member.name[lang]}</strong>, ${member.details[lang]}</p>`
	}

	private buildPresident(member: TMember | undefined): President {
		if (!member) {
			return { text: this.emptyMultiLangText(), image: '' }
		}

		const text = this.buildMultiLangText((lang) => this.formatMemberLine(member, lang))

		return { text, image: member.imageUrl || '' }
	}

	private buildColumns(members: TMember[]): { column1: MultiLangText; column2: MultiLangText } {
		const mid = Math.ceil(members.length / 2)
		const firstHalf = members.slice(0, mid)
		const secondHalf = members.slice(mid)

		const column1 = this.buildMultiLangText((lang) =>
			firstHalf.map((m) => this.formatMemberLine(m, lang)).join('')
		)
		const column2 = this.buildMultiLangText((lang) =>
			secondHalf.map((m) => this.formatMemberLine(m, lang)).join('')
		)

		return { column1, column2 }
	}

	private buildMultiLangText(build: (lang: Lang) => string): MultiLangText {
		return LANGS.reduce((acc, lang) => ({ ...acc, [lang]: build(lang) }), {} as MultiLangText)
	}

	private emptyMultiLangText(): MultiLangText {
		return { ro: '', ru: '', en: '' }
	}
}
