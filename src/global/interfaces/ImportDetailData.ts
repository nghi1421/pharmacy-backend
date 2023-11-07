export interface NewImportDetailData {
    quantity: number;
    batchId: string;
    unitPrice: number;
    expiryDate: Date; 
    drugId: number;
}

export interface ExistsImportDetailData {
    quantity: number;
    quantityImport: number;
    batchId: string;
    unitPrice: number;
    expiryDate: Date; 
    drugId: number;
    oldQuantityImport: number;
    id: number;
}