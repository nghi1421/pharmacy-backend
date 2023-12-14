import { NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import { Socket } from "socket.io";
import config from "../config/config";

export const checkTokenSocket = (socket: Socket, next: NextFunction) => {
    const { token } = socket.handshake.query;
    if (typeof token === 'string') {
        jwt.verify(token, config.accessKey, (error: VerifyErrors, payload: JwtPayload) => {
            if (error) {
                const err: any = new Error("not authorized");
                err.data = { content: "Xác thực thất bại." };
                next(err)
            }
            else {
                if (payload.roleId == 1 || payload.roleId == 3) {
                    next()
                }
                else {
                    const err: any = new Error("Forbidden");
                    err.data = { content: "Không có quyền thực hiện chức năng" };
                    next(err)
                }
            }
        })
    }
    else {
        const err: any = new Error("Forbidden");
        err.data = { content: "Xác thực thất bại." };
        next(err)
    }
}