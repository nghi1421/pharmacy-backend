import { NewExportDetailData } from "./ExportDetailData";

export interface ExportData {
    exportDate: Date;
    staffId: number;
    customerId: number;
    note: string;
    prescriptionId: string;
    type: number;
    exportDetails: NewExportDetailData[];
}