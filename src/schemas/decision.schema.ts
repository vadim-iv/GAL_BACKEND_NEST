import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { MultiLangText } from './shared/text.schema'
import { Member } from './member.schema'
import { DecisionQuestionType } from 'src/enums/decision.enum'

export type DecisionDocument = HydratedDocument<Decision>

@Schema({ _id: false })
export class DecisionOption {

  @Prop({ required: true })
  value: string

  @Prop({ type: MultiLangText, required: true })
  label: MultiLangText
}

@Schema({ _id: false })
export class DecisionAnswer {

  @Prop({ type: Types.ObjectId, ref: Member.name, required: true })
  memberId: Types.ObjectId

  @Prop({ type: String, required: true })
  value: string
}

@Schema()
export class DecisionQuestion {

  _id: Types.ObjectId

  @Prop({ type: MultiLangText, required: true })
  question: MultiLangText

  @Prop({ type: String, enum: DecisionQuestionType, required: true })
  type: DecisionQuestionType

  @Prop({ type: [DecisionOption], required: false })
  options?: DecisionOption[]

  @Prop({ type: [DecisionAnswer], default: [] })
  answers: DecisionAnswer[]
}

@Schema()
export class Decision {

  @Prop({ type: MultiLangText, required: true })
  title: MultiLangText

  @Prop({ type: MultiLangText, required: true })
  description: MultiLangText

  @Prop({ type: [DecisionQuestion], required: true })
  questions: DecisionQuestion[]

  @Prop({ type: Date, required: true })
  voteStart: Date

  @Prop({ type: Date, required: true })
  voteEnd: Date
}

export const DecisionSchema = SchemaFactory.createForClass(Decision)
