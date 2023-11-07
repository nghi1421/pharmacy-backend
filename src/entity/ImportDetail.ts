import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import {
    IsDate,
    IsNotEmpty,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { Import } from './Import';
import { DrugCategory } from './DrugCategory';
import { ColumnNumericTransformer } from '../global/classes/ColumnNumbericTransformer';
import { dateBeforeTodayMessage, maxLengthErrorMessage, numberMaxMesssage, numberMinMesssage, requiredMessage, typeInvalidMessage } from '../config/helper';
import { IsBeforeToday } from '../contraints/IsBeforeToday';

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
    
    // @BeforeRemove()
    // async updateQuantityDrugCategory() {
    //     try {
    //         const drugRepository = AppDataSource.getRepository(DrugCategory)
    //         const importRepository = AppDataSource.getRepository(Import)
    //         const importDetailRepository = AppDataSource.getRepository(ImportDetail)
    //         const imports = await importRepository.find({
    //             where: { importDate: MoreThan(this.import.importDate) },
    //             order: {
    //                 importDate: "DESC"
    //             }
    //         })

    //         let drug: DrugCategory|null = await drugRepository.findOneBy({ id: this.drug.id })
    //         if (drug) {
    //             if (imports.length === 0) {
    //                 drug.quantity = 0;
    //             }
    //             else {
    //                 drug.quantity = drug.quantity - this.quantity
    //                 let importDetail
    //                 for (let myImport of imports) {
    //                     importDetail = await importDetailRepository.findOneBy(
    //                         {
    //                             import: { id: myImport.id },
    //                             drug: { id: this.id } 
    //                         }
    //                     )
    //                     if (importDetail) {
    //                         break;
    //                     }
    //                 }
    //                 if (importDetail) {
    //                     drug.price = calculateUnitPrice(importDetail.unitPrice, drug.quantityConversion);
    //                 } 
    //             }
    //             await drugRepository.save(drug);
    //         } 
    //     } catch (error) {
    //         console.log('ERROR before remove', error)
    //     }
    // }
}