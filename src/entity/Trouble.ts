
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
    IsDate, IsNotEmpty, MaxLength,
} from 'class-validator';
import { Staff } from './Staff';
import { maxLengthErrorMessage, requiredMessage, typeInvalidMessage } from '../utils/helper';
import { DrugCategory } from './DrugCategory';

@Entity('troubles')
@Unique(['batchId', 'drug.id'])
export class Trouble {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'datetime'})
    @IsDate({ message: typeInvalidMessage('Thời gian sự cố')})
    troubleDate: Date

    @ManyToOne(() => Staff, {eager: true})
    @JoinColumn()
    staff: Staff

    @ManyToOne(() => DrugCategory, {eager: true})
    @JoinColumn()
    drug: DrugCategory

    @Column({ type: 'varchar', length: 20})
    @IsNotEmpty({ message: requiredMessage('Mã lô thuốc') })
    @MaxLength(20, { message: maxLengthErrorMessage('Mã lô thuốc', 20)})
    batchId: string

    @Column({ type: 'text', nullable: true })
    note!: string

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}