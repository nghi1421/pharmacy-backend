export interface CustomerData {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    gender: number;
}

export interface SignUpCustomerData {
    username: string
    password: string
    email: string
    name: string;
    phoneNumber: string;
    confirmationPassword: string;
    address: string;
    gender: number;
    deviceToken: string
}