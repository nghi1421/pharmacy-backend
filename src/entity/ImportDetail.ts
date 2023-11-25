import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Unique,
    AfterInsert,
    Repository,
} from 'typeorm';
import {
    IsDate,
    IsNotEmpty,
    Max,
    MaxLength,
    Min,
    validateOrReject,
} from 'class-validator';
import { Import } from './Import';
import { DrugCategory } from './DrugCategory';
import { ColumnNumericTransformer } from '../global/classes/ColumnNumbericTransformer';
import { dateBeforeTodayMessage, maxLengthErrorMessage, numberMaxMesssage, numberMinMesssage, requiredMessage, typeInvalidMessage } from '../utils/helper';
import { IsBeforeToday } from '../contraints/IsBeforeToday';
import { Inventory } from './Inventory';
import { AppDataSource } from '../dataSource';
import { getMonthYearNow, getPreviousYearMonth } from '../utils/time';

@Entity('import_details')
@Unique(['import.id', 'drug.id'])
export class ImportDetail {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Import, { eager: true })
    @JoinColumn()
    import: Import

    @ManyToOne(() => DrugCategory, { eager: true })
    @JoinColumn()
    drug: DrugCategory

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer()})
    @IsNotEmpty({ message: requiredMessage('Số lượng quy đổi')})
    conversionQuantity: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    @Min(0, { message: numberMinMesssage('Số lượng nhập', 0) })
    @IsNotEmpty({ message: requiredMessage('Số lượng nhập')})
    quantity: number

    @Column({ type: 'varchar', length: 20})
    @IsNotEmpty({ message: requiredMessage('Mã lô thuốc') })
    @MaxLength(20, { message: maxLengthErrorMessage('Mã lô thuốc', 20)})
    batchId: string

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    @Min(0, { message: numberMinMesssage('Đơn giá nhập', 0) })
    @IsNotEmpty({ message: requiredMessage('Đơn giá nhập')})
    unitPrice: number

    @Column({ type: 'decimal', precision: 4, scale: 2, transformer: new ColumnNumericTransformer() })
    @Min(0, { message: numberMinMesssage('Thuế VAT', 0) })
    @Max(1, { message: numberMaxMesssage('Thuế VAT', 0)})
    @IsNotEmpty({ message: requiredMessage('Thuế VAT')})
    vat: number

    @Column({ type: 'date'})
    @IsDate({ message: typeInvalidMessage('Hạn sử dụng')})
    @IsBeforeToday({ message: dateBeforeTodayMessage('Hạn sử dụng')})
    expiryDate: Date
    
    @AfterInsert()
    async afterInsert() {
        try {
            const inventoryRepository: Repository<Inventory> = AppDataSource.getRepository(Inventory);
            const monthYearNow = getMonthYearNow();
            const inventory = this.conversionQuantity * this.quantity;
            const drugInventory: Inventory | null = await inventoryRepository.findOneBy(
                {
                    monthYear: monthYearNow,
                    drug: { id: this.drug.id }
                }
            )

            if (!drugInventory) {
                const prevDrugInventory: Inventory | null = await inventoryRepository.findOneBy(
                    {
                        monthYear: getPreviousYearMonth(),
                        drug: { id: this.drug.id }
                    }
                )
                const newInventory = new Inventory();
                
                if (!prevDrugInventory) {
                    newInventory.prevMonthInventoryQuantity = 0
                    newInventory.inventoryImportDetail = inventory
                    newInventory.importDetail = this
                    newInventory.inventoryQuantiy = inventory
                }
                else {
                    newInventory.prevMonthInventoryQuantity = prevDrugInventory.inventoryQuantiy
                    newInventory.inventoryImportDetail = prevDrugInventory.inventoryImportDetail
                    newInventory.importDetail = prevDrugInventory.importDetail
                    newInventory.inventoryQuantiy = prevDrugInventory.inventoryQuantiy + inventory
                }
                newInventory.monthYear = getMonthYearNow();
                newInventory.drug = this.drug
                newInventory.importQuantity = inventory
                newInventory.salesQuantity = 0
                newInventory.brokenQuanity = 0
                
                await validateOrReject(newInventory);
                inventoryRepository.save(newInventory)
            }
            else {
                drugInventory.importQuantity += inventory
                drugInventory.inventoryQuantiy += inventory

                await validateOrReject(drugInventory);
                inventoryRepository.save(drugInventory)
            }
        }
        catch (error) {
            console.log(error)
        }
    }
}