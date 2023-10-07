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
    Length,
} from 'class-validator';
import { Staff } from './Staff';
import { Provider } from './Provider';

@Entity('imports')
export class Import {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, name: 'import_date' })
    @IsNotEmpty()
    @IsDate()
    importDate: Date

    @ManyToOne(() => Staff)
    @JoinColumn()
    staff: Staff

    @ManyToOne(() => Provider)
    @JoinColumn()
    provider: Provider

    @Column({ type: 'text', nullable: true })
    note: string

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0})
    @IsNotEmpty()
    paid: number

    @Column({ type: 'decimal', name: 'total_price', precision: 15, scale: 2, default: 0 })
    @IsNotEmpty()
    totalPrice: number
 
    @Column({ name: 'maturity_date', nullable: true })
    @IsDate()
    maturityDate: Date

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}