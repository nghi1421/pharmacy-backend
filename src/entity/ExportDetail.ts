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
    Min,
} from 'class-validator';
import { DrugCategory } from './DrugCategory';
import { Export } from './Export';
import { Import } from './Import';
import { ColumnNumericTransformer } from '../global/classes/ColumnNumbericTransformer';
import {  numberMaxMesssage, numberMinMesssage, requiredMessage, typeInvalidMessage } from '../config/helper';
import { IsBeforeToday } from '../contraints/IsBeforeToday';

@Entity('export_details')
@Unique(['export.id', 'drug.id', 'import.id'])
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
    @Min(0, { message: numberMinMesssage('Số lượng xuất', 0) })
    @IsNotEmpty({ message: requiredMessage('Số lượng xuất')})
    quantity: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer()})
    @IsNotEmpty({ message: requiredMessage('Đơn giá xuất')})
    unitPrice: number

    @Column({ type: 'decimal', precision: 4, scale: 2, transformer: new ColumnNumericTransformer() })
    @Min(0, { message: numberMinMesssage('Thuế VAT', 0) })
    @Max(1, { message: numberMaxMesssage('Thuế VAT', 0)})
    @IsNotEmpty({ message: requiredMessage('Thuế VAT')})
    vat: number

    @Column({ type: 'date'})
    @IsDate({ message: typeInvalidMessage('Hạn sử dụng') })
    @IsBeforeToday({ message: 'Không thể bán thuốc đã quá hạn.'})
    expiryDate: Date
}