import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    BeforeRemove,
    EntityManager,
} from 'typeorm';
import {
    IsDate,
    IsNotEmpty,
    Min,
} from 'class-validator';
import { DrugCategory } from './DrugCategory';
import { Export } from './Export';
import { Import } from './Import';
import { ColumnNumericTransformer } from '../global/classes/ColumnNumbericTransformer';
import { AppDataSource } from '../dataSource';
import { ImportDetail } from './ImportDetail';

@Entity('export_details')
export class ExportDetail {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Export, { eager: true})
    @JoinColumn()
    export: Export

    @ManyToOne(() => Import, { eager: true})
    @JoinColumn()
    import: Import

    @ManyToOne(() => DrugCategory, { eager: true})
    @JoinColumn()
    drug: DrugCategory

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer()})
    @IsNotEmpty()
    quantity: number

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
    async handleRemoveExportDetail() {
        try {   
            const importDetailRepository = AppDataSource.getRepository(ImportDetail)
            const importDetail = await importDetailRepository.findOneByOrFail({
                import: { id: this.import.id },
                drug: { id: this.drug.id}
            })

            this.drug.quantity = this.drug.quantity + this.quantity

            importDetail.quantity = importDetail.quantity + this.quantity
            await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                await transactionalEntityManager.getRepository(DrugCategory).save(this.drug)
                await transactionalEntityManager.getRepository(ImportDetail).save(importDetail)
            })
        }
        catch (error) {
            console.log(`Error: ${error}`)
        }
    }
}