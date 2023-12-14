import { EntityManager } from "typeorm"
import { AppDataSource } from "../dataSource"
import { Message } from "../entity/Message"
import { Room } from "../entity/Room"
import { Server, Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { Customer } from "../entity/Customer"

const roomRepository = AppDataSource.getRepository(Room)
const customerRepository = AppDataSource.getRepository(Customer)

const getMessages = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const rooms = await roomRepository.find({
                relations: {
                    messages: true
                },
                order: { recent: 'DESC', messages: { id: 'DESC' } }
            });

            resolve({
                message: 'Lấy thông tin nhắn thành công.',
                data: rooms
            })
        }
        catch (error) {
            reject(error)
        }
    })
}

const storeMessage = (roomId: number, content: string, username: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const room = await roomRepository.findOneBy({ id: roomId });
            if (!room) {
                const customer = await customerRepository.findOneBy({ user: { username } });
                if (!customer) {
                    return reject({ errorMessage: 'Không tìm thấy người dùng.' })
                }
                const newRoom = new Room()

                newRoom.name = customer.name;
                newRoom.user = customer.user;
                newRoom.recent = new Date();
                const newMessage = new Message();

                newMessage.content = content;
                newMessage.time = new Date();

                await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                    await transactionalEntityManager.save(newMessage)
                    newMessage.room = newRoom;
                    await transactionalEntityManager.save(room)
                })
            }
            else {
                const newMessage = new Message();

                newMessage.content = content;
                newMessage.room = room;
                newMessage.time = new Date();

                await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                    await transactionalEntityManager.save(newMessage)
                    room.recent = new Date();
                    await transactionalEntityManager.save(room)
                })
            }

            resolve({
                message: 'Nhắn tin thành công.',
            })
        }
        catch (error) {
            reject(error)
        }
    })
}

const handleSocket = (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    console.log('A user connected');

    socket.on('join-room', (roomId, name) => {

        socket.join(roomId);
    });

    socket.on('get-messages', async (roomId) => {
        const result = await getMessages()
        io.to(roomId).emit('messages', result)
    })

    socket.on('chat message', (roomId, message) => {

        io.to(roomId).emit('message', `Room ${roomId}: ${message}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
}

export default {
    getMessages,
    storeMessage,
    handleSocket
}