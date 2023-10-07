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
    IsNotEmpty,
    Length,
    Min,
} from 'class-validator';
import { TypeByUse } from './TypeByUse';

@Entity('drug_categories')
export class DrugCategory {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    @IsNotEmpty()
    @Length(1, 255)
    name: string

    @Column({ unique: true })
    @IsNotEmpty()
    @Length(1, 20)
    unit: string

    @Column({ unique: true })
    @IsNotEmpty()
    @Length(1, 20)
    minimalUnit: string

    @Column({ type: 'decimal', precision: 4, scale: 2 })
    @Min(0)
    @IsNotEmpty()
    vat: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    @IsNotEmpty()
    @Length(1, 255)
    quantityConversion: number
 
    @ManyToOne(() => TypeByUse)
    @JoinColumn()
    type: string

    @Column({ type: 'varchar', length: 255 })
    @Length(1, 255)
    @IsNotEmpty()
    instruction: string

    @Column({ type: 'varchar', length: 255 })
    @Length(1, 1000)
    @IsNotEmpty()
    preserved: string
    
    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}