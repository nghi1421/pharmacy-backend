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
    MaxLength,
    Matches,
    IsDate,
} from 'class-validator';
import { User } from './User'; 
import { Position } from './Position'
import { maxLengthErrorMessage, phoneNumberRegex, requiredMessage, typeInvalidMessage } from '../config/helper';

@Entity('staffs')
export class Staff {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty({ message: requiredMessage('Tên nhân viên')})
    @MaxLength(100, { message: maxLengthErrorMessage('Tên nhân viên', 255)})
    name: string

    @Column({ unique: true })
    @IsNotEmpty({ message: requiredMessage('Email')})
    @IsEmail({}, { message: typeInvalidMessage('Email')})
    @MaxLength(255, { message: maxLengthErrorMessage('Số điện thoại', 255)})
    email: string

    @Column({ name: 'phone_number',  unique: true })
    @IsNotEmpty({ message: requiredMessage('Số điện thoại')})
    @MaxLength(15, { message: maxLengthErrorMessage('Số điện thoại', 15) })
    @Matches(phoneNumberRegex, { message: typeInvalidMessage('Số điện thoại')})
    phoneNumber: string

    @Column({ unique: true })
    @IsNotEmpty({ message: requiredMessage('CCCD')})
    @MaxLength(20, { message: maxLengthErrorMessage('CCCD', 20) })
    identification: string

    @Column()
    @MaxLength(255, { message: maxLengthErrorMessage('Địa chỉ', 255)})
    address!: string
 
    @Column({ nullable: true, type: 'date' })
    @IsDate({ message: typeInvalidMessage('Ngày sinh')})
    dob!: Date

    @Column({ type: 'tinyint' })
    @Max(2)
    @IsNotEmpty({ message: requiredMessage('Giới tính')})
    gender: number

    @Column({ type: 'bit', default: true })
    @IsNotEmpty({ message: requiredMessage('Trạng thái')})
    isWorking: boolean

    @OneToOne(() => User)
    @JoinColumn()
    user: User

    @ManyToOne(() => Position, { eager: true})
    @JoinColumn()
    @IsNotEmpty({ message: requiredMessage('Chức vụ nhân viên')})
    position: Position

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}