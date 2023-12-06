import { Customer } from "../../entity/Customer";
import { DrugCategory } from "../../entity/DrugCategory";

export interface TroubleHistorySales {
    exportId: number
    customer: Customer
    quantity: number
    drug: DrugCategory
}