import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
} from 'typeorm';
import { Room } from './Room';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar' })
    content: string

    @Column({ type: 'datetime' })
    time: Date

    @ManyToOne(() => Room, (room) => room.messages)
    room: Room
}