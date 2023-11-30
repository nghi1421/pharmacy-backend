import authenticateService from '../services/authenticationService'
import { Request, Response } from 'express'
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import config from '../config/config'
import { SignUpCustomerData } from '../global/interfaces/CustomerData'

const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body
        const result = await authenticateService.login(username, password)
        res.cookie("refreshToken", result.refreshToken , {
                httpOnly: true,
                maxAge: parseInt(config.expiryRefreshTokenCookie),
                domain: "localhost",
            })
        res.json(result.response)
    } catch (error: unknown) {
        res.status(500).json(error)
    }
}

const refreshToken = (req: Request, res: Response) => {
    if (req.cookies.refreshToken) {
        const refreshToken: string = req.cookies.refreshToken;
        jwt.verify(refreshToken, config.refreshKey, (error: VerifyErrors, decoded: JwtPayload) => {
            console.log('this is payload',decoded) 
            if (error) {
                res.status(406).json({ errorMessage: "Xác thực thất bại." })
            }
            else { 
                const accessToken = jwt.sign({ 
                    userId: decoded.userId,
                    roleId: decoded.roleId,
                    staffId: decoded.staffId 
                }, config.accessKey, {  
                    expiresIn: config.expiryAccessToken 
                }); 
                res.locals.accessToken = accessToken
            } 
        })
        res.json({ accessToken: res.locals.accessToken }); 
    }
    else {
        res.status(406).json({ errorMessage: 'Xác thực thất bại.' }); 
    } 
}

const changePassword = async (req: Request, res: Response) => {
    try {
        const username: string = req.body.username;
        const oldPassword: string = req.body.oldPassword;
        const newPassword: string = req.body.newPassword;
        const newPasswordConfirmation: string = req.body.confirmationPassword;
        
        if (!username || !oldPassword || !newPassword || !newPasswordConfirmation) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
        }
        else {
            if (newPassword !== newPasswordConfirmation) {
                res.status(400).json({
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
        res.status(500).json(error)
    }
}

const loginCustomer = async (req: Request, res: Response) => {
    try {
        const { username, password, deviceToken } = req.body
        const result = await authenticateService.loginCustomer(username, password, deviceToken)
        res.cookie("mobile-accesstoken-token", result.accessToken , {
            httpOnly: true,
            maxAge: parseInt(config.expiryRefreshTokenCookie),
            domain: "localhost",
        })
        res.json(result.response)
    } catch (error: unknown) {
        res.status(500).json(error)
    }
}

const verifyPhoneNumber = async (req: Request, res: Response) => {
    try {
        const { phoneNumber } = req.body
        const result = await authenticateService.verifyPhoneNumber(phoneNumber)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json(error)
    }
}

const checkAndSendOTPCode = async (req: Request, res: Response) => {
    try {
        const { phoneNumber } = req.body
        const result = await authenticateService.checkAndSendOTPCode(phoneNumber)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json(error)
    }
}



const signUpForCustomer = async (req: Request, res: Response) => {
    try {
        const {
            username,
            password,
            confirmationPassword,
            name,
            phoneNumber,
            address,
            gender,
            deviceToken
        } = req.body

        const data: SignUpCustomerData = {
            username,
            password,
            confirmationPassword,
            name,
            phoneNumber,
            address,
            gender,
            deviceToken
        }

        const result = await authenticateService.signUpForCustomer(data)
        res.status(200).json(result)
    }
    catch (error) {
        res.status(500).json(error)
    }
}

const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { phoneNumber } = req.body
        const result = await authenticateService.forgotPassword(phoneNumber)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json(error)
    }
}

const changePasswordCustomer = async (req: Request, res: Response) => {
    try {
        const phoneNumber: string = req.body.phoneNumber;
        const oldPassword: string = req.body.oldPassword;
        const newPassword: string = req.body.newPassword;
        const confirmationPassword: string = req.body.confirmationPassword;
        
        if (!phoneNumber || !oldPassword || !newPassword || !confirmationPassword) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
        }
        else {
             if (newPassword !== confirmationPassword) {
                res.status(400).json({
                    errorMessage: 'Mật khẩu xác nhận không hợp.'
                })
            }
            else {
                const result = await authenticateService.changePasswordCustomer(phoneNumber, newPassword, oldPassword);
                res.status(200).json(result);
            }
        }
       
    }
    catch (error) {
        res.status(500).json(error)
    }
}

export default {
    login,
    refreshToken,
    changePassword,
    loginCustomer,
    verifyPhoneNumber,
    forgotPassword,
    signUpForCustomer,
    checkAndSendOTPCode,
    changePasswordCustomer
}