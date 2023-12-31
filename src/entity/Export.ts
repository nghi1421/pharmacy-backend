import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import {
    IsDate,
    MaxLength,
    ValidateIf,
} from 'class-validator';
import { Staff } from './Staff';
import { Customer } from './Customer';
import { maxLengthErrorMessage, typeInvalidMessage } from '../utils/helper';

@Entity('exports')
export class Export {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'datetime' })
    @IsDate({ message: typeInvalidMessage('Ngày xuất thuốc') })
    exportDate: Date

    @ManyToOne(() => Staff, { eager: true })
    @JoinColumn()
    staff: Staff

    @ManyToOne(() => Customer, { eager: true })
    @JoinColumn()
    customer: Customer

    @Column({ type: 'varchar', length: 20, nullable: true })
    @MaxLength(20, { message: maxLengthErrorMessage('Mã toa thuốc', 20) })
    @ValidateIf((_, value) => value)
    prescriptionId!: string

    @Column({ type: 'tinyint', default: 1 })
    type: number

    @Column({ type: 'text', nullable: true })
    note: string

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}