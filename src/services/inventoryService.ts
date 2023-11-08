import { In } from "typeorm";
import { AppDataSource } from "../dataSource";
import { Inventory } from "../entity/Inventory";
import { getMonthYearNow, getPreviousYearMonth } from "../config/time";
import { ImportDetail } from "../entity/ImportDetail";
import { validateOrReject } from "class-validator";

const inventoryRepository = AppDataSource.getRepository(Inventory);

const checkInventory = (listQuantity: QuantityRequired[]) => {
    return new Promise(async (resolve, reject) => {
        try {
            const drugIds: number[] = listQuantity.map((quantityRequried) => quantityRequried.drugId);
            const listInventory = await inventoryRepository.find({
                where: {
                    drug: { id: In(drugIds) },
                    monthYear: getMonthYearNow()
                }
            })

            if (listInventory.length !== listQuantity.length) {
                const listThisMonthExistIds: number[] = listInventory.map((invent) => invent.drug.id)
                const setListThisMonthExistIds =  new Set(listThisMonthExistIds)
                const missingIds = drugIds.filter((drugId) => !setListThisMonthExistIds.has(drugId))
                const listPrevMonthInventory = await inventoryRepository.find({
                    where: {
                        drug: { id: In(missingIds) },
                        monthYear: getMonthYearNow()
                    }
                })

                if (listPrevMonthInventory.length !== missingIds.length) {
                    return reject({
                        errorMessage: `Số lượng tồn kho của thuốc không tồn tại.`
                    })
                }
                
            }
        }
        catch (error) {
            reject(error)
        } 
    })
}

const getDrugInventoryPreviousMonth = (drugId: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const prevDrugInventory: Inventory | null = await inventoryRepository.findOneBy(
                { drug: { id: drugId }, monthYear: getPreviousYearMonth() }
            )
            
            if (!prevDrugInventory) {
                return resolve(undefined)
            }
            return resolve(prevDrugInventory)
        }
        catch (error) {
            reject(error)
        }
    })
}

const updateOrGenerateInventoryImport = (importDetail: ImportDetail) => {
    return new Promise(async (resolve, reject) => {
        try {
            const inventoryRepository = AppDataSource.getRepository(Inventory);
            const monthYearNow = getMonthYearNow();
            const inventory = importDetail.conversionQuantity * importDetail.quantity;
            const drugInventory: Inventory | null = await inventoryRepository.findOneBy(
                {
                    monthYear: monthYearNow,
                    drug: { id: importDetail.drug.id }
                }
            )

            if (!drugInventory) {
                await generateInventoryNewMonthImport(importDetail)
            }
            else {
                await updateInventoryImport(drugInventory, inventory)
            }
            resolve({code: 1})
        }
        catch (error) {
            reject(error)
        }
    })
}

const generateInventoryNewMonthImport = (importDetail: ImportDetail): Promise<Inventory> => {
    return new Promise(async (resolve, reject) => {
        try {
            const inventory: number = importDetail.quantity * importDetail.conversionQuantity;
            const prevDrugInventory: Inventory | null = await inventoryRepository.findOneBy(
                {
                    monthYear: getPreviousYearMonth(),
                    drug: { id: importDetail.drug.id }
                }
            )
            const newInventory = new Inventory();
            
            if (!prevDrugInventory) {
                newInventory.prevMonthInventoryQuantity = 0
                newInventory.inventoryImportDetail = inventory
                newInventory.importDetail = importDetail
                newInventory.inventoryQuantiy = inventory
            }
            else {
                newInventory.prevMonthInventoryQuantity = prevDrugInventory.inventoryQuantiy
                newInventory.inventoryImportDetail = prevDrugInventory.inventoryImportDetail
                newInventory.importDetail = prevDrugInventory.importDetail
                newInventory.inventoryQuantiy = prevDrugInventory.inventoryQuantiy + inventory
            }
            newInventory.monthYear = getMonthYearNow();
            newInventory.drug = importDetail.drug
            newInventory.importQuantity = inventory
            newInventory.salesQuantity = 0
            newInventory.brokenQuanity = 0
            
            await validateOrReject(newInventory);
            const data = await inventoryRepository.save(newInventory)
            resolve(data)
        }
        catch (error) {
            reject(error)
        }
    })
}

const updateInventoryImport = (drugInventory: Inventory, inventory: number): Promise<Inventory> => {
    return new Promise(async (resolve, reject) => {
        try {
            drugInventory.importQuantity += inventory
            drugInventory.inventoryQuantiy += inventory
            await validateOrReject(drugInventory);
            await inventoryRepository.save(drugInventory)
            const data = await inventoryRepository.save(drugInventory)
            resolve(data)
        }
        catch (error) {
            reject(error)
        }
    })
}

const generateInventoryNewMonth = (prevDrugInventoryList: Inventory[]): Promise<Inventory[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            const inventoryNewMonth = prevDrugInventoryList.reduce((listNewInventory, prevDrugInventory) => {
                const newInventory = new Inventory();
                newInventory.prevMonthInventoryQuantity = prevDrugInventory.inventoryQuantiy
                newInventory.inventoryImportDetail = prevDrugInventory.inventoryImportDetail
                newInventory.importDetail = prevDrugInventory.importDetail
                newInventory.inventoryQuantiy = prevDrugInventory.inventoryQuantiy
                newInventory.monthYear = getMonthYearNow();
                newInventory.drug = prevDrugInventory.drug
                newInventory.importQuantity = 0
                newInventory.salesQuantity = 0
                newInventory.brokenQuanity = 0
                listNewInventory.push(newInventory);

                return listNewInventory
            }, [] as Inventory[])
            
            await validateOrReject(inventoryNewMonth);
            await inventoryRepository.save(inventoryNewMonth)
            const data = await inventoryRepository.save(inventoryNewMonth)
            resolve(data)
        }
        catch (error) {
            reject(error)
        }
    })
}

export {
    updateOrGenerateInventoryImport,
    checkInventory
}