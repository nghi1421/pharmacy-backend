export interface Meta {
    page: number
    perPage: number
    total: number
    totalPage: number
}

export interface DataResponse<T> {
    message: string;
    data: T[];
    meta?: Meta
}