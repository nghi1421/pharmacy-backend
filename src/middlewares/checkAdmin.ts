import { NextFunction, Request, Response } from "express"
import { RoleEnum } from "../global/enums/RoleEnum";

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    switch (res.locals.roleId) {
        case RoleEnum.Admin: {
            break;
        }
        case RoleEnum.Seller: {
            res.status(403).json({errorMessage: 'Bạn không có quyền thực hiện hành động này.'})
            return;
        }
        case RoleEnum.Customer: {
            res.status(403).json({errorMessage: 'Bạn không có quyền thực hiện hành động này.'})
            return;
        }
        default: {
            res.status(500).json({ errorMessage: 'Lỗi server.' })
            return;
        }
    }
    next()
}