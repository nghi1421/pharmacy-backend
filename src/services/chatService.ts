import { EntityManager } from "typeorm"
import { AppDataSource } from "../dataSource"
import { Message } from "../entity/Message"
import { Room } from "../entity/Room"

const roomRepository = AppDataSource.getRepository(Room)

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

const storeMessage = (roomId: number, content: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const room = await roomRepository.findOneBy({ id: roomId });
            if (!room) {
                return reject({ errorMessage: 'Không tìm thấy phòng chat.' })
            }
            const newMessage = new Message();

            newMessage.content = content;
            newMessage.room = room;
            newMessage.time = new Date();

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
        catch (error) {
            reject(error)
        }
    })
}

export default {
    getMessages,
    storeMessage,
}