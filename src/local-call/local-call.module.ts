import { Module } from '@nestjs/common'
import { LocalCallService } from './local-call.service'
import { LocalCallController } from './local-call.controller'
import { AwsModule } from 'src/aws/aws.module'
import { MongooseModule } from '@nestjs/mongoose'
import { LocalCall, LocalCallSchema } from 'src/schemas/local_call.schema'
import { Member, MemberSchema } from 'src/schemas/member.schema'

@Module({
	imports: [
		AwsModule,
		MongooseModule.forFeature([
			{ name: LocalCall.name, schema: LocalCallSchema },
			{ name: Member.name, schema: MemberSchema }
		])
	],
	controllers: [LocalCallController],
	providers: [LocalCallService]
})
export class LocalCallModule {}
