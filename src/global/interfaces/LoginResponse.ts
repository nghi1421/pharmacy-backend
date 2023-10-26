import { Role } from "../../entity/Role";
import { Staff } from "../../entity/Staff";

export interface LoginResponse {
    response: {
        message: string;
    data: {
        id: number;
        username: string;
        staff: Staff;
        role: Role;
    };
        accessToken: string;
    }
    refreshToken: string;
}