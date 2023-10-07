import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import {
    IsNotEmpty,
    Length,
    IsEmail,
    Max,
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

    @Column({ unique: true })
    @IsNotEmpty()
    @IsEmail()
    @Length(1, 255)
    email: string

    @Column({ name: 'phone_number',  unique: true })
    @IsNotEmpty()
    @Length(1, 15)
    phoneNumber: string

    @Column({ unique: true })
    @IsNotEmpty()
    @Length(1, 20)
    identification: string

    @Column()
    @Length(1, 255)
    address: string
 
    @Column({ nullable: true, type: 'date' })
    dob: Date

    @Column({ type: 'tinyint' })
    @Max(2)
    @IsNotEmpty()
    gender: number

    @Column({ type: 'bit', default: true})
    isWorking: boolean

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