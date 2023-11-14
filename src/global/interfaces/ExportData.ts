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