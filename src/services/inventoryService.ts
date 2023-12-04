import { In, Repository } from "typeorm";
import { Inventory } from "../entity/Inventory";
import { getMonthYearNow, getPreviousYearMonth } from "../utils/time";
import { ImportDetail } from "../entity/ImportDetail";
import { validateOrReject } from "class-validator";
import { AppDataSource } from "../dataSource";
import { QuantityRequired } from "../global/interfaces/QuantityRequired";

const checkInventory = (listQuantity: QuantityRequired[]): Promise<boolean> => {
    const inventoryRepository: Repository<Inventory> = AppDataSource.getRepository(Inventory);

    return new Promise(async (resolve, reject) => {
        try {
            const drugIds: number[] = listQuantity.map((quantityRequried) => quantityRequried.drugId);
            let listInventory: Inventory[] = await inventoryRepository.find({
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
                        monthYear: getPreviousYearMonth()
                    }
                })

                if (listPrevMonthInventory.length !== missingIds.length) {
                    return reject({
                        errorMessage: `Số lượng tồn kho của thuốc không tồn tại.`
                    })
                }
                const newIvnentories = await generateInventoryNewMonth(listPrevMonthInventory)
                listInventory.push(...newIvnentories)
            }

            listInventory.forEach((inventory) => {
                const drugInventory: QuantityRequired | undefined =
                    listQuantity.find((item) => item.drugId === inventory.drug.id)
                
                if (drugInventory && drugInventory.quantity > inventory.inventoryQuantiy) {
                    return resolve(false)
                } 
            })
            resolve(true)
        }
        catch (error) {
            reject(error)
        } 
    })
}

const getDrugInventory = (drugId: number): Promise<Inventory | null> => {
    return new Promise(async (resolve, reject) => {
        try {
            const inventoryThisMonth: Inventory | null = await getDrugInventoryThisMonth(drugId)
            
            if (!inventoryThisMonth) {
                const ivnentoryPrevMonth: Inventory | null = await getDrugInventoryPreviousMonth(drugId)
                resolve(ivnentoryPrevMonth)    
            }
            else {
                resolve(inventoryThisMonth)
            }
        }
        catch (error) {
            reject(error)
        }
    })
}

const getDrugInventoryPreviousMonth = (drugId: number): Promise<Inventory | null> => {
    const inventoryRepository: Repository<Inventory> = AppDataSource.getRepository(Inventory);
    return new Promise(async (resolve, reject) => {
        try {
            const prevDrugInventory: Inventory | null = await inventoryRepository.findOneBy(
                { drug: { id: drugId }, monthYear: getPreviousYearMonth() }
            )
            resolve(prevDrugInventory)
        }
        catch (error) {
            reject(error)
        }
    })
}

const getDrugInventoryThisMonth = (drugId: number): Promise<Inventory | null> => {
    const inventoryRepository: Repository<Inventory> = AppDataSource.getRepository(Inventory);
    return new Promise(async (resolve, reject) => {
        try {
            const drugInventory: Inventory | null = await inventoryRepository.findOneBy(
                { drug: { id: drugId }, monthYear: getMonthYearNow() }
            )
            resolve(drugInventory)
        }
        catch (error) {
            reject(error)
        }
    })
}

const updateOrGenerateInventoryImport = (importDetail: ImportDetail) => {
    const inventoryRepository: Repository<Inventory> = AppDataSource.getRepository(Inventory);
    return new Promise(async (resolve, reject) => {
        try {
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
    const inventoryRepository: Repository<Inventory> = AppDataSource.getRepository(Inventory);
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
    const inventoryRepository: Repository<Inventory> = AppDataSource.getRepository(Inventory);
    return new Promise(async (resolve, reject) => {
        try {
            drugInventory.importQuantity += inventory
            drugInventory.inventoryQuantiy += inventory
            await validateOrReject(drugInventory);
            const data = await inventoryRepository.save(drugInventory)
            resolve(data)
        }
        catch (error) {
            reject(error)
        }
    })
}

const generateInventoryNewMonth = (prevDrugInventoryList: Inventory[]): Promise<Inventory[]> => {
    const inventoryRepository: Repository<Inventory> = AppDataSource.getRepository(Inventory);
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

// const checkImportInventory = (importRequired: ImportQuantityRequired[]) => {
//     return new Promise(async (resolve, reject) => {
//         try {   
//             const inventoryRepository = AppDataSource.getRepository(Inventory);
//             const importRepository = AppDataSource.getRepository(Import);
//             const drugIds = importRequired.map((element) => element.drugId);
//             let listInventory: Inventory[] = await inventoryRepository.find({
//                 where: {
//                     drug: { id: In(drugIds) },
//                     monthYear: getMonthYearNow()
//                 }
//             })

//             if (listInventory.length !== importRequired.length) {
//                 const listThisMonthExistIds: number[] = listInventory.map((invent) => invent.drug.id)
//                 const setListThisMonthExistIds =  new Set(listThisMonthExistIds)
//                 const missingIds = drugIds.filter((drugId) => !setListThisMonthExistIds.has(drugId))
//                 const listPrevMonthInventory = await inventoryRepository.find({
//                     where: {
//                         drug: { id: In(missingIds) },
//                         monthYear: getPreviousYearMonth()
//                     }
//                 })

//                 if (listPrevMonthInventory.length !== missingIds.length) {
//                     return reject({
//                         errorMessage: `Số lượng tồn kho của thuốc không tồn tại.`
//                     })
//                 }
//                 const newIvnentories = await generateInventoryNewMonth(listPrevMonthInventory)
//                 listInventory.push(...newIvnentories)
//             }

//             importRequired.forEach(async (drugRequired) => {
//                 const inventoryDrug: Inventory | undefined =
//                     listInventory.find((item) => drugRequired.drugId === item.drug.id)
                
//                 if (inventoryDrug) {
//                     if (inventoryDrug.importDetail.import.id === drugRequired.drugId) {
//                         if (drugRequired.quantity > inventoryDrug.inventoryImportDetail) {
//                             return resolve(false);
//                         }
//                     }
//                     else {
//                         const importData: Import | null = await importRepository.findOne({
//                             where: { id: inventoryDrug.importDetail.import.id}
//                         })
//                         if (importData) {
//                             if (importData.id < drugRequired.importId) {
//                                 return resolve(false);
//                             }
//                             else {
//                                 //query check import detail.
//                             }
//                         }
//                         else {
//                             return resolve(false);
//                         }
//                     }
//                 }
//                 else {
//                     return resolve(false);
//                 }
//             })
//             resolve(true)
//         }
//         catch (error) {

//         }
//     })
// }

export default {
    updateOrGenerateInventoryImport,
    getDrugInventory,
    getDrugInventoryPreviousMonth,
    getDrugInventoryThisMonth,
    checkInventory
}