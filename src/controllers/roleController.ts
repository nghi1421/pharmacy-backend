import { Request, Response } from 'express'
import roleService from '../services/roleService'

const getRoles = async (req: Request, res: Response) => {
    try {
        const result = await roleService.getRoles();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getRoles
}
