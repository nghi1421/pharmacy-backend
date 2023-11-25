import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import {
    IsNotEmpty, Min,
} from 'class-validator';
import { numberMinMesssage, requiredMessage } from '../utils/helper';
import { ColumnNumericTransformer } from '../global/classes/ColumnNumbericTransformer';
import { ImportDetail } from './ImportDetail';
import { DrugCategory } from './DrugCategory';

@Entity('inventories')
@Unique(['drug.id', 'monthYear'])
export class Inventory {
    @PrimaryGeneratedColumn()
    id: number
 
    @ManyToOne(() => DrugCategory, {eager: true})
    @JoinColumn()
    drug: DrugCategory

    @Column({ type: 'varchar', length: 6 })
    @IsNotEmpty({ message: requiredMessage('Tháng năm')})
    monthYear: string;

    @ManyToOne(() => ImportDetail, {eager: true})
    @JoinColumn()
    importDetail: ImportDetail

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    @IsNotEmpty({ message: requiredMessage('Số lượng tồn chi tiết nhập')})
    inventoryImportDetail: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    @Min(0, { message: numberMinMesssage('Số lượng tồn đầu tháng', 0) })
    @IsNotEmpty({ message: requiredMessage('Số lượng tồn đầu tháng')})
    prevMonthInventoryQuantity: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    @IsNotEmpty({ message: requiredMessage('Tổng số lượng nhập')})
    importQuantity: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    @IsNotEmpty({ message: requiredMessage('Tổng số lượng xuất')})
    salesQuantity: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    @IsNotEmpty({ message: requiredMessage('Tổng số lượng xuất')})
    brokenQuanity: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    @Min(0, { message: numberMinMesssage('Số lượng nhập', 0) })
    @IsNotEmpty({ message: requiredMessage('Số lượng nhập')})
    inventoryQuantiy: number

    @Column()
    @CreateDateColumn({ name: 'created_at'})
    createdAt: Date

    @Column()
    @UpdateDateColumn({ name: 'updated_at'})
    updatedAt: Date
}