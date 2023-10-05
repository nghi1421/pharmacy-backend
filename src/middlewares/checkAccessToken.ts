import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import config from '../config/config'

export const checkAccessToken = (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.status(401).send()
        return
    }
    
    const accessToken = req.headers.authorization.split(' ')[1] as string

    try {
        jwt.verify(accessToken, config.accessKey, (error: VerifyErrors, payload: JwtPayload) => {
            if (error) {
                res.status(401).send()
            }
        })
    } catch (error) {
        res.status(401).send()
        return
    }
    next()
}