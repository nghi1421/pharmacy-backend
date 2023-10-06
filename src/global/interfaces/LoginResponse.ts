export interface LoginResponse {
    message: string;
    data: {
        id: number;
        username: string;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
}