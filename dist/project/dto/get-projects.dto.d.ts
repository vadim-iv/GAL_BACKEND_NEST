import { SortDirection, SortOptions } from 'src/enums/sorting.enum';
export declare class GetProjectsDto {
    page?: number;
    limit?: number;
    sort?: SortOptions;
    sortDirection?: SortDirection;
}
