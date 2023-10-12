export interface NewExportDetailData {
    quantity: number;
    unitPrice: number; 
    drugId: number;
    vat: number;
    expiryDate: Date
}

export interface ExistsExportDetailData {
    quantity: number;
    unitPrice: number; 
    drugId: number;
    vat: number;
    expiryDate: Date
    oldQuantity: number;
    id: number;
}