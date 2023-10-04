import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column()
    password: string

    @Column('created_at')
    @CreateDateColumn()
    createdAt: Date

    @Column('updated_at')
    @UpdateDateColumn()
    updatedAt: Date
}