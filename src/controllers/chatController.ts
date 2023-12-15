import { Request, Response } from 'express'
import chatService from '../services/chatService'

const getMessagesFromRoomId = async (req: Request, res: Response) => {
    try {
        const roomId = parseInt(req.params.roomId)
        const result = await chatService.getMessagesFromRoomId(roomId)
        res.status(200).json(result)
    }
    catch (error) {
        res.status(500).json(error)
    }
}

const getMessages = async (req: Request, res: Response) => {
    try {
        const result = await chatService.getMessages()
        res.status(200).json(result)
    }
    catch (error) {
        res.status(500).json(error)
    }
}

export default {
    getMessagesFromRoomId,
    getMessages
}