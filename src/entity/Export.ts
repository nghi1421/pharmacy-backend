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
import { Customer } from './Customer';

@Entity('exports')
export class Export {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'date'})
    @IsDate()
    exportDate: Date

    @ManyToOne(() => Staff, {eager: true})
    @JoinColumn()
    staff: Staff

    @ManyToOne(() => Customer, {eager: true})
    @JoinColumn()
    customer: Customer

    @Column({ type: 'text', nullable: true })
    note: string
 
    @Column({ type: 'varchar', length: 20 })
    @IsNotEmpty()
    prescriptionId: string

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}