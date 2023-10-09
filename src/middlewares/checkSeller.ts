import { NextFunction, Request, Response } from "express"
import { RoleEnum } from "../global/enums/RoleEnum";

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    switch (res.locals.roleId) {
        case RoleEnum.Admin: {
            res.status(403).json({errorMessage: 'You don\'t have permission to this acction. Please check the authentication'})
            return;
        }
        case RoleEnum.Seller: {
            break;
        }
        case RoleEnum.Customer: {
            res.status(403).json({errorMessage: 'You don\'t have permission to this acction. Please check the authentication'})
            return;
        }
        default: {
            res.status(500).json({ errorMessage: 'Error from server.' })
            return;
        }
    }
    next()
}