import { Request, Response } from 'express'
import userService from '../services/userService'
import { UserData } from '../global/interfaces/UserData';
import { DataResponse } from '../global/interfaces/DataResponse';
import { User } from '../entity/User';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { QueryParam } from '../global/interfaces/QueryParam';
import { getQueryParams } from '../utils/helper';

const getUsers = async (req: Request, res: Response) => {
    try {
        const queryParams: QueryParam = await getQueryParams(req)
        const result: DataResponse<User> = await userService.getUsers(queryParams);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeUser = async (req: Request, res: Response) => {
    try {
        let { 
            username,
        } = req.body
        const roleId = parseInt(req.body.roleId)
        const staffId = parseInt(req.body.staffId)
        const data: UserData = {
            username,
            roleId,
            staffId,
        }
        const result: DataOptionResponse<User> = await userService.storeUser(data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateUser = async (req: Request, res: Response) => {
    try {
        let { 
            username,
        } = req.body
        const roleId = parseInt(req.body.roleId)
        const staffId = parseInt(req.body.staffId)
        const data: UserData = {
            username,
            roleId,
            staffId,
        }
        const result: DataOptionResponse<User> = await userService.updateUser(data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId: number = parseInt(req.params.userId)
        const result: DataOptionResponse<User> = await userService.deleteUser(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getUsers,
    storeUser,
    updateUser,
    deleteUser
}