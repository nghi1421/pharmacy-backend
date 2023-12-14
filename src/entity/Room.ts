import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Message } from './Message';
import { User } from './User';

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 255 })
    name: string

    @OneToOne(() => User, { eager: true })
    @JoinColumn()
    user: User

    @Column({ type: 'datetime' })
    recent: Date

    @OneToMany(() => Message, (message) => message.room)
    messages: Message[]
}