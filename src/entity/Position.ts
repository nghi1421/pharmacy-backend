import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    IsNotEmpty, MaxLength,
} from 'class-validator';
import { maxLengthErrorMessage, requiredMessage } from '../config/helper';

@Entity('positions')
export class Position {
    @PrimaryGeneratedColumn()
    id: number
 
    @Column({ length: 100 })
    @IsNotEmpty({ message: requiredMessage('Tên chức vụ')})
    @MaxLength(100, { message: maxLengthErrorMessage('Tên chức vụ', 100)})
    name: string

    @Column()
    @CreateDateColumn({ name: 'created_at'})
    createdAt: Date

    @Column()
    @UpdateDateColumn({ name: 'updated_at'})
    updatedAt: Date
}