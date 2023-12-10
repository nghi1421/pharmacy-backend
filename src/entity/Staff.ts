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
    IsEmail,
    Max,
    MaxLength,
    Matches,
    IsDate,
    ValidateIf,
} from 'class-validator';
import { User } from './User'; 
import { Position } from './Position'
import { maxLengthErrorMessage, phoneNumberRegex, requiredMessage, stringOnlyNumberRegex, typeInvalidMessage } from '../utils/helper';
import { BoolBitTransformer } from '../global/classes/BoolBitTransformer';

@Entity('staffs')
export class Staff {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty({ message: requiredMessage('Tên nhân viên')})
    @MaxLength(100, { message: maxLengthErrorMessage('Tên nhân viên', 100)})
    name: string

    @Column({ unique: true })
    @IsNotEmpty({ message: requiredMessage('Email')})
    @IsEmail({}, { message: typeInvalidMessage('Email')})
    @MaxLength(255, { message: maxLengthErrorMessage('Email', 255)})
    email: string

    @Column({ name: 'phone_number',  unique: true, length: 15 })
    @IsNotEmpty({ message: requiredMessage('Số điện thoại')})
    @MaxLength(15, { message: maxLengthErrorMessage('Số điện thoại', 15) })
    @Matches(phoneNumberRegex, { message: typeInvalidMessage('Số điện thoại')})
    phoneNumber: string

    @Column({ unique: true, length: 20 })
    @IsNotEmpty({ message: requiredMessage('CCCD') })
    @Matches(stringOnlyNumberRegex, { message: typeInvalidMessage('CCCD')})
    @MaxLength(20, { message: maxLengthErrorMessage('CCCD', 20) })
    identification: string

    @Column({ nullable: true})
    @MaxLength(255, { message: maxLengthErrorMessage('Địa chỉ', 255) })
    @ValidateIf((_, value) => value) 
    address!: string
 
    @Column({ nullable: true, type: 'date' })
    @IsDate({ message: typeInvalidMessage('Ngày sinh') })
    @ValidateIf((_, value) => value)
    dob!: Date

    @Column({ type: 'tinyint' })
    @Max(2) 
    @IsNotEmpty({ message: requiredMessage('Giới tính')})
    gender: number

    @Column({ type: 'bit', default: true, transformer: new BoolBitTransformer() })
    @IsNotEmpty({ message: requiredMessage('Trạng thái')})
    isWorking: boolean

    @OneToOne(() => User, { eager: true})
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