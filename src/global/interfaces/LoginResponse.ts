import { Customer } from "../../entity/Customer";
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

export interface LoginCustomerResponse {
    response: {
        message: string;
        data: {
            id: number;
            roomId: number;
            username: string;
            customer: Customer;
            role: Role;
        },
        accessToken: string;
    }
    accessToken: string;
}