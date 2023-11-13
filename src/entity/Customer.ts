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

    @Column({ length: 100})
    @IsNotEmpty({ message: requiredMessage('Tên khách hàng')})
    @MaxLength(100, { message: maxLengthErrorMessage('Tên nhân viên', 100)})
    name: string

    @Column({ name: 'phone_number',  unique: true, length: 15 })
    @IsNotEmpty({ message: requiredMessage('Số điện thoại')})
    @MaxLength(15, { message: maxLengthErrorMessage('Số điện thoại', 15) })
    @Matches(phoneNumberRegex, { message: typeInvalidMessage('Số điện thoại')})
    phoneNumber: string

    @Column()
    @MaxLength(255, { message: maxLengthErrorMessage('Địa chỉ', 255) })
    address: string


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