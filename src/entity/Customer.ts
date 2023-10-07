import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import {
    IsNotEmpty,
    Length,
    IsEmail
} from 'class-validator';
import { User } from './User'; 

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty()
    @Length(1, 100)
    name: string

    @Column({ unique: true })
    @IsNotEmpty()
    @IsEmail()
    @Length(1, 255)
    email: string

    @Column({ name: 'phone_number',  unique: true })
    @IsNotEmpty()
    @Length(1, 15)
    phoneNumber: string

    @Column()
    @Length(1, 255)
    address: string
 
    @Column({ nullable: true, type: 'date' })
    dob: Date

    @Column()
    @IsNotEmpty()
    gender: number

    @OneToOne(() => User)
    @JoinColumn()
    user: User

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}