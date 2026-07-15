import { Type } from 'class-transformer'
import { IsNumber, IsOptional, Max, Min } from 'class-validator'

export class GetProjectsDto {
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	page?: number

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	@Max(16)
	limit?: number
}
