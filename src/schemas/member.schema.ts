import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { MultiLangText } from './shared/text.schema'
import { MemberRolesEnum } from 'src/enums/member.enum'

export type TMember = HydratedDocument<Member>

@Schema()
export class Member {
	@Prop({ type: String, required: true, unique: true })
	email: string

	@Prop({ type: String, required: true })
	password: string

    @Prop({ type: MultiLangText, required: true })
    name: MultiLangText

    @Prop({ type: MultiLangText, required: true })
    details: MultiLangText

    @Prop({ type: String, required: false })
    imageUrl?: string

    @Prop({ type: String, enum: MemberRolesEnum, required: true })
    role: MemberRolesEnum
}

export const MemberSchema = SchemaFactory.createForClass(Member)