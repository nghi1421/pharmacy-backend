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
    Max
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
    @Length(8, 255)
    username: string

    @Column()
    @IsNotEmpty()
    @Max(1000)
    password: string

    @ManyToOne(() => Role)
    @JoinColumn()
    role: Role

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