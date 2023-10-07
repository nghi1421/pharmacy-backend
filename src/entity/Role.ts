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

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number
 
    @Column({ unique: true })
    @Length(1, 100)
    @IsNotEmpty()
    name: string

    @Column()
    @Length(1, 255)
    @IsNotEmpty()
    detail: string

    @Column()
    @CreateDateColumn({ name: 'created_at'})
    createdAt: Date

    @Column()
    @UpdateDateColumn({ name: 'updated_at'})
    updatedAt: Date
}