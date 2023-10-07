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
    IsEmail
} from 'class-validator';

@Entity('providers')
export class Provider {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    @IsNotEmpty()
    @Length(1, 100)
    name: string

    @Column({ unique: true })
    @IsNotEmpty()
    @IsEmail()
    @Length(1, 255)
    email: string

    @Column({ unique: true })
    @IsNotEmpty()
    @Length(1, 15)
    phoneNumber: string

    @Column({ nullable: true })
    @Length(1, 255)
    address: string
 
    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}