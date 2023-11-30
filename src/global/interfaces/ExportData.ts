import { CustomerData } from "./CustomerData";
import { NewExportDetailData } from "./ExportDetailData";

export interface ExportData {
    exportDate: Date;
    staffId: number;
    note: string;
    prescriptionId: string;
    type: number;
    exportDetails: NewExportDetailData[];
    customer: CustomerData
}

export interface EditExportData {
    id: number
    note: string
    staffId: number;
    prescriptionId: string;
    type: number
    customer: CustomerData
    exportDetails: NewExportDetailData[];
}