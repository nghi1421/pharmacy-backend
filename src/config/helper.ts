import { ValidationError } from "class-validator"

export const maxLengthErrorMessage =   (c: string, n: number) => `${c} tối đa ${n} kí tự.`

export const typeInvalidMessage =  (c: string) => `${c} không hợp lệ.`

export const numberInvalidMesssage = (c: string) => `${c} phải là số.`

export const requiredMessage = (c: string) => `${c} bắt buộc.`

export const numberMinMesssage = (c: string, n: number) => `Giá trị ${c} phải lớn hơn ${n}.`

export const numberMaxMesssage = (c: string, n: number) => `Giá trị ${c} phải nhỏ hơn ${n}.`

export const phoneNumberRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/

export const stringOnlyNumberRegex = /^\d+$/

export const getErrors = (errors: ValidationError[]) => {
    return errors.map((error: ValidationError) => {
        const key = error.property
        let value
        if (error.constraints) {
            value = Object.values(error.constraints)
        }
        return {key, value}
    })
}