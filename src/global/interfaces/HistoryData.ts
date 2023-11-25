
export interface HistoryData {
    id: number;
    staffName: string;
    time: string;
    total: string;
    totalWithoutVat: string
    vat: string
    prescriptionId: string
    historyDetail: HistoryDetail[]
}

export interface HistoryDetail {
    drugName: string
    quantity: string
    unitPrice: string
}

export interface History {
    title: string
    histories: HistoryData[]
}

