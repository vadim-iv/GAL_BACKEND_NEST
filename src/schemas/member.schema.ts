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

    // Long bio, used only for the President's own dedicated public paragraph.
    @Prop({ type: MultiLangText, required: false })
    details?: MultiLangText

    // Short blurb, used as the <li> entry everywhere else this member appears
    // (Executive/Administration/Committee/Censorship/General Assembly).
    @Prop({ type: MultiLangText, required: true })
    shortDetails: MultiLangText

    @Prop({ type: String, required: false })
    imageUrl?: string

    @Prop({ type: [String], enum: MemberRolesEnum, required: true })
    roles: MemberRolesEnum[]

    // Forgot-password flow: hash of the token sent in the reset-link email, plus
    // its expiry. Never store the plain token — only its hash is comparable.
    @Prop({ type: String, required: false })
    resetPasswordTokenHash?: string

    @Prop({ type: Date, required: false })
    resetPasswordTokenExpires?: Date
}

export const MemberSchema = SchemaFactory.createForClass(Member)