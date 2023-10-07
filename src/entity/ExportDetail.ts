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

@Entity('export_details')
@Unique(['export.id', 'drug.id'])
export class ExportDetail {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Export)
    @JoinColumn()
    export: Export

    @ManyToOne(() => DrugCategory)
    @JoinColumn()
    drug: DrugCategory

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0})
    @IsNotEmpty()
    amount: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0})
    @IsNotEmpty()
    unitPrice: number

    @Column({ type: 'int'})
    @IsNotEmpty()
    importDetailId: number

    @Column({ type: 'decimal', precision: 4, scale: 2 })
    @Min(0)
    @IsNotEmpty()
    vat: number

    @Column({ type: 'date'})
    @IsDate()
    expiryDate: Date
}