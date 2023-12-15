import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
} from 'typeorm';
import { Room } from './Room';
import { BoolBitTransformer } from '../global/classes/BoolBitTransformer';

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

    @Column({ type: 'bit', default: true, transformer: new BoolBitTransformer() })
    fromCustomer: boolean
}