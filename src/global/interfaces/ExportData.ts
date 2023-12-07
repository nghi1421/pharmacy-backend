import { CustomerData } from "./CustomerData";
import { NewExportDetailData } from "./ExportDetailData";

export interface ExportData<T> {
    exportDate: Date;
    staffId: number;
    note: string;
    type: number;
    exportDetails: T[];
    customer: CustomerData;
}

export interface EditExportData {
    id: number
    note: string
    staffId: number;
    type: number
    customer: CustomerData
    exportDetails: NewExportDetailData[];
}

