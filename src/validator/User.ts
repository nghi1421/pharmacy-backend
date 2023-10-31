import {
  Contains,
  IsInt,
  Length,
  IsFQDN,
  IsDate,
  Min,
  Max,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class User {
    @MaxLength(100, {message: 'Tên tối đa 100 kí tự.'})
    name: string;

    @MaxLength(255, {message: 'Email tối đa 255 kí tự.'})
    @IsEmail({}, {message: 'Email không hợp lệ.'})
    email: string;

    @MaxLength(15, {message: 'Số điện thoại tối đa 15 kí tự.'})
    phoneNumber: string;

    @IsInt()
    @Min(0)
    @Max(2)
    gender: number;

    @IsFQDN()
    site: string;

    @IsDate()
    createDate: Date;
}
