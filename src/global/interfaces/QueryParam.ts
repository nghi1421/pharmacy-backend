export interface QueryParam {
    page: number;
    perPage: number;
    orderBy: string;
    orderDirection: 'ASC' | 'DESC';
    searchTerm: string;
    searchColumns: string[]
}