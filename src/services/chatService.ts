import { EntityManager } from "typeorm"
import { AppDataSource } from "../dataSource"
import { Message } from "../entity/Message"
import { Room } from "../entity/Room"
import { Server, Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { Customer } from "../entity/Customer"
import { GetDataResponse } from "../global/interfaces/DataOptionResponse"

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

const getMessagesFromRoomId = (roomId: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const rooms = await roomRepository.findOne({
                relations: {
                    messages: true
                },
                where: {
                    id: roomId
                },
                order: { messages: { id: 'ASC' } }
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

const storeMessage = (roomId: number, content: string, username: string, fromCustomer: boolean):
    Promise<GetDataResponse<Message>> => {
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
                newMessage.fromCustomer = fromCustomer;

                await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                    await transactionalEntityManager.save(newMessage)
                    newMessage.room = newRoom;
                    await transactionalEntityManager.save(room)
                })
                resolve({
                    message: 'Nhắn tin thành công.',
                    data: newMessage
                })
            }
            else {
                const newMessage = new Message();

                newMessage.content = content;
                newMessage.room = room;
                newMessage.time = new Date();
                newMessage.fromCustomer = fromCustomer;

                await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
                    await transactionalEntityManager.save(newMessage)
                    room.recent = new Date();
                    await transactionalEntityManager.save(room)
                })
                resolve({
                    message: 'Nhắn tin thành công.',
                    data: newMessage
                })
            }
        }
        catch (error) {
            reject(error)
        }
    })
}

const handleSocket = (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    socket.on('join-room', (roomId: number) => {
        socket.join(roomId.toString());
    });

    socket.on('get-messages', async (roomId) => {
        getMessages()
            .then(data => {
                io.to(roomId).emit('messages', data.data)
            })
            .catch(() => {
                io.to(roomId).emit('error', 'Kết nối không ổn định.')
            })
    })

    socket.on('get-messages-from-room', async (roomId) => {
        getMessagesFromRoomId(roomId)
            .then(data => {
                io.to(roomId).emit('messages', data.data.messages)
            })
            .catch(() => {
                io.to(roomId).emit('error', 'Kết nối không ổn định.')

            })
    })

    socket.on('chat message', (roomId, message: string, phoneNumber: string, username: string) => {
        if (phoneNumber) {
            customerRepository.findOneBy({ phoneNumber: phoneNumber })
                .then(customer => {
                    if (customer && customer.user) {
                        storeMessage(roomId, message, customer.user.username, true)
                            .then((data) => {
                                console.log('emit message', data)
                                io.to(roomId).emit('message', message, true, data.data.time, data.data.id)
                            })
                    }

                })
        }
        else {
            storeMessage(roomId, message, username, false)
                .then((data) => {
                    io.to(roomId).emit('message', message, false, data.data.time, data.data.id);
                })
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
}

export default {
    getMessages,
    storeMessage,
    handleSocket,
    getMessagesFromRoomId
}