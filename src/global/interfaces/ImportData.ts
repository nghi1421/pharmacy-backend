import { NewImportDetailData } from "./ImportDetailData";

export interface ImportData {
    importDate: Date;
    note: string;
    providerId: number;
    staffId: number; 
    importDetails: NewImportDetailData[];
}