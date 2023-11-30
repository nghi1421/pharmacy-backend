import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import config from '../config/config'

export const checkAccessToken = (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.status(401).json({errorMessage: 'Phiên làm việc hết hạn.'})
        return
    }
    
    const accessToken: string = req.headers.authorization.split(' ')[1] as string
    try {
        jwt.verify(accessToken, config.accessKey, (error: VerifyErrors, payload: JwtPayload) => {
            if (error) {
                res.status(401).json({errorMessage: 'Phiên làm việc hết hạn.'})
                return;
            }
            else {
                if (payload) {
                    res.locals.staffId = payload.staffId
                    res.locals.roleId = payload.roleId
                }
                else {
                    res.status(401).json({errorMessage: 'Phiên làm việc hết hạn.'})
                }
            }
        })
    } catch (error) {
        res.status(401).json({errorMessage: 'Phiên làm việc hết hạn.'})
        return
    }
    next()
}