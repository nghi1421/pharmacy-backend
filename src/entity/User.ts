import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import {
    IsNotEmpty,
    Length,
} from 'class-validator';
import bcrypt from 'bcrypt';
import { Role } from './Role';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Index({ unique: true })
    @IsNotEmpty()
    @Length(6, 255)
    username: string

    @Column()
    @IsNotEmpty()
    @Length(1, 1000)
    password: string

    @ManyToOne(() => Role, { eager: true })
    @JoinColumn()
    @IsNotEmpty()
    role: Role

    @Column({ nullable: true })
    deviceToken!: string

    @Column()
    @CreateDateColumn({ name: 'created_at'})
    createdAt: Date

    @Column()
    @UpdateDateColumn({ name: 'updated_at'})
    updatedAt: Date

    public hashPasswrod(): void {
        this.password = bcrypt.hashSync(this.password, 10)
    }

    public checkPassword(rawPassword: string): boolean  {
        return bcrypt.compareSync(rawPassword, this.password);
    }
}