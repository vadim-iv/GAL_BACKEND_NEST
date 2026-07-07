import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { MultiLangText } from './shared/text.schema'
import { Member } from './member.schema'
import { ApprovalStatusEnum } from 'src/enums/status.enum'

export type LocalCallDocument = HydratedDocument<LocalCall>

@Schema({ _id: false })
export class ProjectAnswer {
	@Prop({ type: Types.ObjectId, required: true })
	questionId: Types.ObjectId

	@Prop({ type: Types.ObjectId, ref: Member.name, required: true })
	memberId: Types.ObjectId

	@Prop({ type: Number, required: true, min: 0, max: 10 })
	answer: number
}

@Schema()
export class Project {
	_id: Types.ObjectId

	@Prop({ type: MultiLangText, required: true })
	title: MultiLangText

	@Prop({ type: MultiLangText, required: true })
	description: MultiLangText

	@Prop({ type: String, required: true })
	pdfUrl: string

	@Prop({ type: String, required: false })
	imageUrl?: string

	@Prop({ type: String, enum: ApprovalStatusEnum, default: ApprovalStatusEnum.PENDING, required: true })
	status: ApprovalStatusEnum

	@Prop({ type: [ProjectAnswer], required: false, default: [] })
	answers: ProjectAnswer[]
}

@Schema()
export class LocalCallQuestion {
	_id: Types.ObjectId

	@Prop({ type: MultiLangText, required: true })
	question: MultiLangText

	@Prop({ type: Number, required: true, min: 1, max: 10, default: 10 })
	maxScore: number
}

@Schema({ timestamps: true })
export class LocalCall {
	@Prop({ type: MultiLangText, required: true })
	name: MultiLangText

	@Prop({ type: MultiLangText, required: true })
	description: MultiLangText

	@Prop({ type: String, required: false })
	imageUrl?: string

	@Prop({ type: [LocalCallQuestion], required: true })
	questions: LocalCallQuestion[]

	@Prop({ type: [Project], required: false, default: [] })
	projects: Project[]

	@Prop({ type: Date, required: true })
	voteStart: Date

	@Prop({ type: Date, required: true })
	voteEnd: Date
}

export const LocalCallSchema = SchemaFactory.createForClass(LocalCall)
