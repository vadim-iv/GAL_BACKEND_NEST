import { Module } from '@nestjs/common'
import { MembersService } from './members.service'
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
	providers: [MembersService],
  exports: [MembersService]
})
export class MembersModule {}
