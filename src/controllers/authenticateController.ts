import authenticateService from '../services/authenticationService'
import { Request, Response } from 'express'
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import config from '../config/config'

const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const result = await authenticateService.login(username, password)
        res.cookie("refresh-token", result.refreshToken , {
                httpOnly: true,
                maxAge: parseInt(config.expiryRefreshTokenCookie),
                domain: "localhost",
            })
        res.json(result.response)
    } catch (error: unknown) {
        res.json(error)
    }
}

const refreshToken = (req: Request, res: Response) => {
    if (req.cookies?.jwt) {
        const refreshToken: string = req.cookies.jwt;
        jwt.verify(refreshToken, config.refreshKey, (error: VerifyErrors, decoded: JwtPayload) => {
            if (error) {
                return res.status(406).json({message: "Xác thực thất bại."})
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
        res.status(406).json({ message: 'Xác thực thất bại.' }); 
    } 
}

const changePassword = async (req: Request, res: Response) => {
    try {
        const username: string = req.body.username;
        const oldPassword: string = req.body.old_password;
        const newPassword: string = req.body.new_password;
        const newPasswordConfirmation: string = req.body.new_password_confirmation;
        
        if (!username || !oldPassword || !newPassword || !newPasswordConfirmation) {
            res.status(401).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
        }
        else {
            if (newPassword !== newPasswordConfirmation) {
                res.status(401).json({
                    errorMessage: 'Mật khẩu xác nhận không hợp.'
                })
            }
            else {
                const result = await authenticateService.changePassword(username, newPassword, oldPassword);
                res.status(200).json(result);
            }
        }
    }
    catch (error) {

    }
}

export default {
    login,
    refreshToken,
    changePassword
}