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
    IsNotEmpty,
} from 'class-validator';
import { Staff } from './Staff';
import { Provider } from './Provider';
import { typeInvalidMessage } from '../config/helper';

@Entity('imports')
export class Import {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'date'})
    @IsDate({ message: typeInvalidMessage('Ngày nhập thuốc')})
    importDate: Date

    @ManyToOne(() => Staff, {eager: true})
    @JoinColumn()
    staff: Staff

    @ManyToOne(() => Provider, {eager: true})
    @JoinColumn()
    provider: Provider

    @Column({ type: 'text', nullable: true })
    note!: string

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, nullable: true})
    @IsNotEmpty()
    paid: number
 
    @Column({ name: 'maturity_date', nullable: true, type: 'date' })
    @IsDate({ message: typeInvalidMessage('Ngày đáo hạn')})
    maturityDate: Date

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}