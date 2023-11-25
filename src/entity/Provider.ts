import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    IsNotEmpty,
    IsEmail,
    MaxLength,
    Matches,
    ValidateIf
} from 'class-validator';
import { maxLengthErrorMessage, phoneNumberRegex, requiredMessage, typeInvalidMessage } from '../utils/helper';

@Entity('providers')
export class Provider {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, length: 100 })
    @IsNotEmpty({ message: requiredMessage('Tên công ty dược')})
    @MaxLength(100, { message: maxLengthErrorMessage('Tên công ty dược', 100)})
    name: string
 
    @Column({ unique: true })
    @IsNotEmpty({ message: requiredMessage('Email')})
    @IsEmail({}, { message: typeInvalidMessage('Email')})
    @MaxLength(255, { message: maxLengthErrorMessage('Email', 255)})
    email: string

    @Column({ unique: true, length: 15 })
    @IsNotEmpty({ message: requiredMessage('Số điện thoại')})
    @MaxLength(15, { message: maxLengthErrorMessage('Số điện thoại', 15) })
    @Matches(phoneNumberRegex, { message: typeInvalidMessage('Số điện thoại')})
    phoneNumber: string

    @Column({ nullable: true })
    @MaxLength(255, { message: maxLengthErrorMessage('Địa chỉ', 255) })
    @ValidateIf((_, value) => value) 
    address!: string
 
    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date
}