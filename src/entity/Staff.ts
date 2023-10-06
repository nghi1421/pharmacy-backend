import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    Index,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import {
    IsNotEmpty,
    Length,
    IsDate
} from 'class-validator';
import { User } from './User';
import { Position } from './Position'

@Entity('staffs')
export class Staff {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty()
    @Length(1, 100)
    name: string

    @Column()
    @Index({ unique: true })
    @IsNotEmpty()
    @Length(1, 255)
    email: string

    @Column({ name: 'phone_number' })
    @Index({ unique: true })
    @IsNotEmpty()
    @Length(1, 15)
    phoneNumber: string

    @Column()
    @IsNotEmpty()
    @Index({ unique: true })
    @Length(1, 20)
    identification: string

    @Column()
    @Length(1, 255)
    address: string
 
    @Column()
    @IsDate()
    dob: Date

    @Column()
    @IsNotEmpty()
    gender: number

    @OneToOne(() => User)
    @JoinColumn()
    user: User

    @ManyToOne(() => Position)
    @JoinColumn()
    position: Position

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}