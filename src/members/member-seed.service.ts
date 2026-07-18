import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Member } from 'src/schemas/member.schema'
import { ManagementService } from 'src/management/management.service'
import { MEMBER_SEED_DATA } from './member-seed.data'

// TEMPORARY one-time data migration: wipes every member and replaces them with
// the hardcoded list in member-seed.data.ts, built from membri.txt. Runs
// automatically on app boot (no local access to the target DB to run this as a
// standalone script instead) — remove this service, its registration in
// MembersModule, and member-seed.data.ts once the real DB has been seeded.
@Injectable()
export class MemberSeedService implements OnModuleInit {
	private readonly logger = new Logger(MemberSeedService.name)

	constructor(
		@InjectModel(Member.name) private memberModel: Model<Member>,
		private readonly managementService: ManagementService
	) {}

	async onModuleInit() {
		await this.ensureEmailIndexIsSparse()

		const existingCount = await this.memberModel.countDocuments()
		this.logger.warn(`[member-seed] Wiping ${existingCount} existing member(s) and inserting ${MEMBER_SEED_DATA.length} seed member(s)...`)

		await this.memberModel.deleteMany({})

		// Not insertMany: none of these seed entries have an `email`, and
		// insertMany's bulk-write path serializes that absent field as an explicit
		// `null` rather than omitting it, unlike create()/save() (the same path
		// MembersService.create() already uses for email-less members elsewhere in
		// the app).
		for (const seedMember of MEMBER_SEED_DATA) {
			await this.memberModel.create(seedMember)
		}

		// The public site's management sections (President/Executive Body/etc.) are
		// read from a separate Management collection that only reflects members once
		// synced — bypassing MembersService's normal create() path means that sync
		// never happens on its own.
		await this.managementService.syncFromMembers()

		this.logger.warn('[member-seed] Done.')
	}

	// The `email` field's unique index predates the optional-email feature (added
	// earlier this project) and was originally created WITHOUT `sparse: true` —
	// updating the Mongoose schema to add `sparse: true` doesn't retroactively
	// rebuild an index that already exists under the same name in the database, so
	// the stale non-sparse version is still what's actually enforced. A plain
	// unique index treats every document missing `email` as colliding on the same
	// implicit null key, so a second (or, as discovered while testing this seed,
	// even the SECOND ever) email-less member hits a duplicate-key error. Dropping
	// and letting Mongoose recreate it from the current schema (sparse: true) only
	// needs to happen once — safe to leave running here since it's a no-op once
	// the index is already correct.
	private async ensureEmailIndexIsSparse() {
		const indexes = await this.memberModel.collection.indexes()
		const emailIndex = indexes.find((index) => index.name === 'email_1')

		if (emailIndex && !emailIndex.sparse) {
			this.logger.warn('[member-seed] Rebuilding non-sparse email_1 index as sparse...')
			await this.memberModel.collection.dropIndex('email_1')
			await this.memberModel.syncIndexes()
		}
	}
}
