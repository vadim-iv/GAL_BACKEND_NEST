import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { MultiLangText } from './shared/text.schema'
import { MemberRolesEnum } from 'src/enums/member.enum'

export type TMember = HydratedDocument<Member>

@Schema()
export class Member {
	// Optional: a member with no email is a public-profile-only entry with no
	// voting-platform account. `sparse` is required alongside `unique` — a plain
	// unique index treats every document missing the field as colliding on the
	// same implicit null key, so a second email-less member would otherwise hit
	// a duplicate-key error.
	@Prop({ type: String, required: false, unique: true, sparse: true })
	email?: string

	// Only set when `email` is present (account exists).
	@Prop({ type: String, required: false })
	password?: string

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