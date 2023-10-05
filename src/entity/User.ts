import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import {
    IsNotEmpty,
    Length,
    Max
} from 'class-validator';
import bcrypt from 'bcrypt';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsNotEmpty()
    @Length(8, 255)
    username: string

    @Column()
    @IsNotEmpty()
    @Max(1000)
    password: string

    @Column()
    @IsNotEmpty()
    @Max(20)
    role: string

    @Column('created_at')
    @CreateDateColumn()
    createdAt: Date

    @Column('updated_at')
    @UpdateDateColumn()
    updatedAt: Date

    public hashPasswrod(): void {
        this.password = bcrypt.hashSync(this.password, 10)
    }

    public checkPassword(rawPassword: string): boolean  {
        return bcrypt.compareSync(rawPassword, this.password);
    }
}