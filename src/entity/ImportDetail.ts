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
    Min,
} from 'class-validator';
import { Import } from './Import';
import { DrugCategory } from './DrugCategory';

@Entity('import_details')
@Unique(['import.id', 'drug.id'])
export class ImportDetail {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Import)
    @JoinColumn()
    import: Import

    @ManyToOne(() => DrugCategory)
    @JoinColumn()
    drug: DrugCategory

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0})
    @IsNotEmpty()
    quantity: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0})
    @IsNotEmpty()
    quantityImport: number

    @Column()
    @IsNotEmpty()
    batchId: string

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0})
    @IsNotEmpty()
    unitPrice: number

    @Column({ type: 'decimal', precision: 4, scale: 2 })
    @Min(0)
    @IsNotEmpty()
    vat: number

    @Column({ type: 'date'})
    @IsDate()
    expiryDate: Date
}