export interface DataOptionResponse<T> {
    message?: string;
    data?: T;
    errorMessage?: string
}

export interface GetDataResponse<T> {
    message: string;
    data: T
}