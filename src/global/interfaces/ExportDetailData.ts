export interface NewExportDetailData {
    quantity: number;
    drugId: number;
}

export interface ExistsExportDetailData {
    quantity: number;
    drugId: number;
    oldQuantity: number;
    id: number;
}