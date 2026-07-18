import { Module } from '@nestjs/common'
import { MembersService } from './members.service'
import { MemberSeedService } from './member-seed.service'
import { MembersController } from './members.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Member, MemberSchema } from 'src/schemas/member.schema'
import { ManagementModule } from 'src/management/management.module'
import { AwsModule } from 'src/aws/aws.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
		ManagementModule,
		AwsModule
	],
	controllers: [MembersController],
	// TEMPORARY: MemberSeedService — remove once the one-time member import has run
	// against the target DB (see member-seed.service.ts and the POST
	// /members/run-seed endpoint in members.controller.ts).
	providers: [MembersService, MemberSeedService],
  exports: [MembersService]
})
export class MembersModule {}
