import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator'
import { SortDirection, SortOptions } from 'src/enums/sorting.enum'

export class GetDecisionsDto {
    // Pagination
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

    // Sorting
    @IsOptional()
    @IsEnum(SortOptions)
    sort?: SortOptions = SortOptions.CREATED_AT

    @IsOptional()
    @IsEnum(SortDirection)
    sortDirection?: SortDirection = SortDirection.DESC
}
