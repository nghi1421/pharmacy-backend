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
    IsEmail,
    MaxLength,
    Matches,
    IsDate,
    ValidateIf
} from 'class-validator';
import { User } from './User'; 
import { maxLengthErrorMessage, phoneNumberRegex, requiredMessage, typeInvalidMessage } from '../config/helper';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty({ message: requiredMessage('Tên khách hàng')})
    @MaxLength(100, { message: maxLengthErrorMessage('Tên nhân viên', 100)})
    name: string

    @Column({ unique: true })
    @IsNotEmpty({ message: requiredMessage('Email')})
    @IsEmail({}, { message: typeInvalidMessage('Email')})
    @MaxLength(255, { message: maxLengthErrorMessage('Email', 255)})
    email: string

    @Column({ name: 'phone_number',  unique: true })
    @IsNotEmpty({ message: requiredMessage('Số điện thoại')})
    @MaxLength(15, { message: maxLengthErrorMessage('Số điện thoại', 15) })
    @Matches(phoneNumberRegex, { message: typeInvalidMessage('Số điện thoại')})
    phoneNumber: string

    @Column()
    @MaxLength(255, { message: maxLengthErrorMessage('Địa chỉ', 255) })
    address: string
 
    @Column({ nullable: true, type: 'date' })
    @IsDate({ message: typeInvalidMessage('Ngày sinh') })
    @ValidateIf((_, value) => value)
    dob!: Date

    @Column({ type: 'tinyint'})
    @IsNotEmpty({ message: requiredMessage('Giới tính')})
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