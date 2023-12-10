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
import { ColumnNumericTransformer } from '../global/classes/ColumnNumbericTransformer';
import { numberMinMesssage, requiredMessage, typeInvalidMessage } from '../utils/helper';
import { Trouble } from './Trouble';
import { Export } from './Export';

@Entity('trouble_details')
@Unique(['export.id', 'trouble.id'])
export class TroubleDetail {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Trouble, { eager: true })
    @JoinColumn()
    trouble: Trouble

    @ManyToOne(() => Export, { eager: true })
    @JoinColumn()
    export: Export

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    @Min(0, { message: numberMinMesssage('Số lượng xuất', 0) })
    @IsNotEmpty({ message: requiredMessage('Số lượng xuất') })
    quantity: number

    @Column({ type: 'datetime' })
    @IsDate({ message: typeInvalidMessage('Thời gian thu hồi.') })
    recoveryTime: Date
}