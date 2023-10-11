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
import { ColumnNumericTransformer } from '../global/classes/ColumnNumbericTransformer';

@Entity('drug_categories')
export class DrugCategory {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    @IsNotEmpty()
    @Length(1, 255)
    name: string

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    @IsNotEmpty()
    price: number

    @Column({ type: 'decimal', precision: 19, scale: 2, transformer: new ColumnNumericTransformer(), })
    @IsNotEmpty()
    quantity: number

    @Column()
    @IsNotEmpty()
    @Length(1, 20)
    form: string
 
    @Column()
    @IsNotEmpty()
    @Length(1, 20)
    unit: string

    @Column()
    @IsNotEmpty()
    @Length(1, 20)
    minimalUnit: string

    @Column({ type: 'decimal', precision: 4, scale: 2 })
    @Min(0)
    @IsNotEmpty()
    vat: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    @IsNotEmpty()
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

    public addQuantityFromImport(quantity: number): void {
        this.quantity = this.quantity + quantity
    }
}