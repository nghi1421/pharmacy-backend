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
import { DrugCategory } from './DrugCategory';
import { Export } from './Export';
import { Import } from './Import';
import { ColumnNumericTransformer } from '../global/classes/ColumnNumbericTransformer';

@Entity('export_details')
export class ExportDetail {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Export)
    @JoinColumn()
    export: Export

    @ManyToOne(() => Import)
    @JoinColumn()
    import: Import

    @ManyToOne(() => DrugCategory)
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
}