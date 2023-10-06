import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    IsNotEmpty,
    Length,
} from 'class-validator';

@Entity('drug-categories')
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

    @Column({ type: 'decimal', precision: 15, scale: 2})
    @IsNotEmpty()
    price: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0})
    @IsNotEmpty()
    quantity: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    @IsNotEmpty()
    @Length(1, 255)
    quantityConversion: number
 
    @Column({ type: 'varchar', length: 255 })
    @Length(1, 255)
    @IsNotEmpty()
    type: string

    @Column({ type: 'varchar', length: 255 })
    @Length(1, 255)
    @IsNotEmpty()
    uses: string

    @Column({ type: 'varchar', length: 255 })
    @Length(1, 255)
    @IsNotEmpty()
    instruction: string

    @Column({ type: 'varchar', length: 1000 })
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