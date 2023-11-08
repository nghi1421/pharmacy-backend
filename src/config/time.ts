import dayjs from "dayjs"

export const getMonthYearNow = (): string => {
    const month = dayjs().month()
    const year = dayjs().year()
    return `${month > 8 ? month +1 : '0' + month}${year}`
}

export const getPreviousYearMonth = (): string => {
    let month = dayjs().month()
    if (month === 0) {
        month = 11;
    }
    else {
        month -= 1
    }
    const year = dayjs().year()
    return `${month > 8 ? month +1 : '0' + month}${year}`
}