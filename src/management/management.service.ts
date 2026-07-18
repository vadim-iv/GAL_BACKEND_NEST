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
			members.filter((m) => m.roles.includes(role)).sort((a, b) => a.name.ro.localeCompare(b.name.ro))

		const president: President = this.buildPresident(byRole(MemberRolesEnum.PRESIDENT)[0])
		const executive: Executive = this.buildColumns(byRole(MemberRolesEnum.EXECUTIVE_BODY))
		const administration: Administration = this.buildColumns(byRole(MemberRolesEnum.ADMINISTRATION))
		const committee: Committee = this.buildColumns(byRole(MemberRolesEnum.SELECTION_COMMITTEE))
		const censorship: Censorship = this.buildColumns(byRole(MemberRolesEnum.CENSORSHIP_COMMITTEE))
		const general_assembly: GeneralAssembly = this.buildColumns(byRole(MemberRolesEnum.GENERAL_ASSEMBLY))

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

	// Rich-text fields can contain arbitrary block structure (headings, multiple
	// paragraphs, lists, etc.) — inlining that raw into the single <p> the
	// short-detail format wraps everything in would nest block elements inside a
	// <p>, which is invalid HTML; the browser "fixes" it by force-closing that
	// <p> early, which is exactly what was showing up as an unwanted line break.
	// Flatten to plain text instead: swap block boundaries for a space (so
	// concatenated blocks don't run words together) then strip every tag —
	// guarantees a single clean paragraph no matter what was typed in.
	private toPlainText(html: string): string {
		return html
			.replace(/<\/(p|h[1-6]|li|div|br)>/gi, ' ')
			.replace(/<[^>]+>/g, '')
			.replace(/\s+/g, ' ')
			.trim()
	}

	// Long bio — President's own dedicated paragraph. Name goes bold and uppercase
	// on its own line above the bio (not inline), since this is a standalone
	// paragraph, not a list entry alongside other members. Email (if the member
	// has one) goes on its own plain, non-bold line directly beneath the name.
	private formatPresidentDetail(member: TMember, lang: Lang): string {
		const details = member.details?.[lang] || ''
		const emailLine = member.email ? `<p>${member.email}</p>` : ''
		return `<p><strong>${member.name[lang].toUpperCase()}</strong></p>${emailLine}${details}`
	}

	// Short blurb — used as the <li> entry everywhere else a member appears. Name
	// (and email, if present) is concatenated inline with a comma, all as one
	// single paragraph.
	private formatShortDetail(member: TMember, lang: Lang): string {
		const details = this.toPlainText(member.shortDetails[lang])
		const emailSegment = member.email ? `, ${member.email}` : ''
		return `<p><strong>${member.name[lang]}</strong>${emailSegment}, ${details}</p>`
	}

	private buildPresident(member: TMember | undefined): President {
		if (!member) {
			return { text: this.emptyMultiLangText(), image: '' }
		}

		const text = this.buildMultiLangText((lang) => this.formatPresidentDetail(member, lang))

		return { text, image: member.imageUrl || '' }
	}

	private buildColumns(members: TMember[]): { column1: MultiLangText; column2: MultiLangText } {
		if (members.length === 0) {
			return { column1: this.emptyMultiLangText(), column2: this.emptyMultiLangText() }
		}

		const mid = Math.ceil(members.length / 2)
		const firstHalf = members.slice(0, mid)
		const secondHalf = members.slice(mid)

		const column1 = this.buildMultiLangText(
			(lang) => `<ol>${firstHalf.map((m) => `<li>${this.formatShortDetail(m, lang)}</li>`).join('')}</ol>`
		)

		const column2 =
			secondHalf.length > 0
				? this.buildMultiLangText(
						(lang) =>
							`<ol start="${firstHalf.length + 1}">${secondHalf.map((m) => `<li>${this.formatShortDetail(m, lang)}</li>`).join('')}</ol>`
					)
				: this.emptyMultiLangText()

		return { column1, column2 }
	}

	private buildMultiLangText(build: (lang: Lang) => string): MultiLangText {
		return LANGS.reduce((acc, lang) => ({ ...acc, [lang]: build(lang) }), {} as MultiLangText)
	}

	private emptyMultiLangText(): MultiLangText {
		return { ro: '', ru: '', en: '' }
	}
}
