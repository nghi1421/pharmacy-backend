import { Role } from "../../entity/Role";

export interface LoginResponse {
    message: string;
    data: {
        id: number;
        username: string;
        role: Role;
    };
    accessToken: string;
    refreshToken: string;
}