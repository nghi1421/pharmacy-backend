import authenticateService from '../services/authenticationService'
import { Request, Response } from 'express'
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import config from '../config/config'

const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const result = await authenticateService.login(username, password)

        res.json(result)
    } catch (error: unknown) {
        res.json(error)
    }
}

const refreshToken = (req: Request, res: Response) => {
    if (req.cookies?.jwt) {
        const refreshToken = req.cookies.jwt;
        jwt.verify(refreshToken, config.refreshKey, (error: VerifyErrors, decoded: JwtPayload) => {
            if (error) {
                return res.status(406).json({message: "Unauthorized"})
            }
            else { 
                const accessToken = jwt.sign({ 
                    id: decoded.id,
                    role: decoded.role,
                }, config.accessKey, { 
                    expiresIn: config.expiryAccessToken 
                }); 
                return res.json({ accessToken }); 
            } 
        })
    }
    else {
        res.status(406).json({ message: 'Unauthorized' }); 
    } 
}

export default {
    login,
    refreshToken
}