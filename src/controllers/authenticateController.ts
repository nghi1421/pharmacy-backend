import authenticateService from '../services/authenticationService'
import { Request, Response } from 'express'

const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const result = await authenticateService.login(username, password)

        res.json(result)
    } catch (error: unknown) {
        res.json({
            erorrMessage: 'Server not response.'
        })
    }
}

export default {
    login
}