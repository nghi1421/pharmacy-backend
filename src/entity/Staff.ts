import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    Index,
    JoinColumn,
} from 'typeorm';
import {
    IsNotEmpty,
    Max,
    IsDate
} from 'class-validator';
import { User } from './User';

@Entity('staffs')
export class Staff {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty()
    @Max(100)
    name: string

    @Column()
    @IsNotEmpty()
    @Max(255)
    email: string

    @Column({ name: 'phone_number' })
    @Index({ unique: true })
    @IsNotEmpty()
    @Max(15)
    phoneNumber: string

    @Column()
    @IsNotEmpty()
    @Max(20)
    identification: string

    @Column()
    @Max(255)
    address: string

    @Column()
    @IsDate()
    dob: Date

    @Column()
    @IsNotEmpty()
    gender: number

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date

    @OneToOne(() => User)
    @JoinColumn()
    user: User
}