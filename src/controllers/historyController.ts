import { Request, Response } from "express";
import historyService from "../services/historyService";

const getHistory = async (req: Request, res: Response) => {
    try {
        const phoneNumber: string = req.params.phoneNumber
        const result = await historyService.getHistory(phoneNumber)
        res.status(200).json(result)
    }
    catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getHistory
}