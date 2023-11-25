import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    IsNotEmpty,
    MaxLength,
} from 'class-validator';
import { maxLengthErrorMessage, requiredMessage } from '../utils/helper';

@Entity('type_by_uses')
export class TypeByUse {
    @PrimaryGeneratedColumn()
    id: number 
 
    @Column({ unique: true, length: 100 })
    @IsNotEmpty({ message: requiredMessage('Tên công dụng')})
    @MaxLength(100, { message: maxLengthErrorMessage('Tên công dụng', 100)})
    name: string 

    @Column({ length: 255 }) 
    @IsNotEmpty({ message: requiredMessage('Mô tả')})
    @MaxLength(255, { message: maxLengthErrorMessage('Mô tả', 255)})
    detail: string

    @Column() 
    @CreateDateColumn({ name: 'created_at'})
    createdAt: Date

    @Column()
    @UpdateDateColumn({ name: 'updated_at'})
    updatedAt: Date
}