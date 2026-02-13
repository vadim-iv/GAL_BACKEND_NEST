import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { MultiLangText } from './shared/text.schema'
import { Member } from './member.schema'

export type ProjectDocument = HydratedDocument<Project>

@Schema({ _id: false })
export class ProjectAnswer {
    @Prop({ type: Types.ObjectId, ref: Member.name, required: true })
    memberId: Types.ObjectId

    @Prop({ type: Number, required: true, min: 0, max: 10 })
    answer: number
}

@Schema()
export class ProjectQuestion {
	_id: Types.ObjectId
	
    @Prop({ type: MultiLangText, required: true })
    question: MultiLangText

    @Prop({ type: [ProjectAnswer], required: false })
    answers: ProjectAnswer[]
}

@Schema()
export class Project {
	@Prop({ type: MultiLangText, required: true })
	title: MultiLangText

	@Prop({ type: MultiLangText, required: true })
	description: MultiLangText

	@Prop({ type: String, required: true })
	pdfUrl: string

	@Prop({ type: [ProjectQuestion], required: true })
	questions: ProjectQuestion[]

	@Prop({ type: Date, required: true })
	voteStart: Date

	@Prop({ type: Date, required: true })
	voteEnd: Date
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
