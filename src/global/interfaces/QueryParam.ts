export interface QueryParam {
    page: number;
    perPage: number;
    orderBy: string;
    orderDirection: 'ASC' | 'DESC';
    searchTerm: string;
    searchColumns: string[]
    filterValue: string
    filterColumn: string
}