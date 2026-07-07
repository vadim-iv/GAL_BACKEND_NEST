import { PartialType } from '@nestjs/mapped-types'
import { LocalCallDto } from './local-call.dto'

export class UpdateLocalCallDto extends PartialType(LocalCallDto) {}
