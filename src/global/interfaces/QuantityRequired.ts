
export interface QuantityRequired {
    drugId: number;
    quantity: number;
}

export interface ImportQuantityRequired {
    drugId: number;
    quantity: number;
    importId: number;
}

export interface ImportQuantityHandle {
    drugId: number;
    quantity: number;
    importId: number;
    type: string;
}