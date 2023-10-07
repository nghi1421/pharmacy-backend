import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    IsNotEmpty,
} from 'class-validator';

@Entity('positions')
export class Position {
    @PrimaryGeneratedColumn()
    id: number
 
    @Column({ length: 100 })
    @IsNotEmpty()
    name: string

    @Column()
    @CreateDateColumn({ name: 'created_at'})
    createdAt: Date

    @Column()
    @UpdateDateColumn({ name: 'updated_at'})
    updatedAt: Date
}