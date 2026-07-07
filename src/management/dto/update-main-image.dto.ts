import { IsString } from 'class-validator'

export class UpdateMainImageDto {
	@IsString()
	main_image: string
}
