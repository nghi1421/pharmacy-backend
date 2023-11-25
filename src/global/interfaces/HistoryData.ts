
export interface HistoryData {
    staffName: string;
    time: string;
    total: number;
    historyDetail: HistoryDetail[]
}

export interface HistoryDetail {
    drugName: string
    quantity: number
    unitPrice: number
    vat: number
}

export interface History {
    title: string
    histories: HistoryData[]
}

