import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Unique,
    BeforeRemove,
    MoreThan,
} from 'typeorm';
import {
    IsDate,
    IsNotEmpty,
    Min,
} from 'class-validator';
import { Import } from './Import';
import { DrugCategory } from './DrugCategory';
import { AppDataSource } from '../dataSource';
import { ColumnNumericTransformer } from '../global/classes/ColumnNumbericTransformer';
import { calculateUnitPrice } from '../services/calculationService';

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
    @IsNotEmpty()
    quantity: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer()})
    @IsNotEmpty()
    quantityImport: number

    @Column()
    @IsNotEmpty()
    batchId: string

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer()})
    @IsNotEmpty()
    unitPrice: number

    @Column({ type: 'decimal', precision: 4, scale: 2, transformer: new ColumnNumericTransformer() })
    @Min(0)
    @IsNotEmpty()
    vat: number

    @Column({ type: 'date'})
    @IsDate()
    expiryDate: Date
    
    @BeforeRemove()
    async updateQuantityDrugCategory() {
        try {
            const drugRepository = AppDataSource.getRepository(DrugCategory)
            const importRepository = AppDataSource.getRepository(Import)
            const importDetailRepository = AppDataSource.getRepository(ImportDetail)
            const imports = await importRepository.find({
                where: { importDate: MoreThan(this.import.importDate) },
                order: {
                    importDate: "DESC"
                }
            })

            let drug: DrugCategory|null = await drugRepository.findOneBy({ id: this.drug.id })
            if (drug) {
                if (imports.length === 0) {
                    drug.quantity = 0;
                }
                else {
                    drug.quantity = drug.quantity - this.quantity
                    let importDetail
                    for (let myImport of imports) {
                        importDetail = await importDetailRepository.findOneBy(
                            {
                                import: { id: myImport.id },
                                drug: { id: this.id } 
                            }
                        )
                        if (importDetail) {
                            break;
                        }
                    }
                    if (importDetail) {
                        drug.price = calculateUnitPrice(importDetail.unitPrice, drug.quantityConversion);
                    } 
                }
                await drugRepository.save(drug);
            } 
        } catch (error) {
            console.log('ERROR before remove', error)
        }
    }
}