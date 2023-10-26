export interface GetDataResponse<T> {
    message?: string;
    data?: T;
    errorMessage?: string;
}