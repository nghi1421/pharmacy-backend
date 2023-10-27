export interface DataOptionResponse<T> {
    message?: string;
    data?: T;
    errorMessage?: string
}