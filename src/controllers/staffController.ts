import { Request, Response } from 'express'
import staffService from '../services/staffService'

const getStaffs = async (req: Request, res: Response) => {
    try {
        const result = await staffService.getStaffs();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
   getStaffs
}