import { IsString, IsNotEmpty } from 'class-validator'

export class ConfirmPasswordResetDto {
	@IsString()
	@IsNotEmpty()
	token: string
}
