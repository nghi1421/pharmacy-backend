import { Request, Response } from 'express'
import userService from '../services/userService'
import { UserData } from '../global/interfaces/UserData';
import { DataResponse } from '../global/interfaces/DataResponse';
import { User } from '../entity/User';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';

const getUsers = async (req: Request, res: Response) => {
    try {
        const result: DataResponse<User> = await userService.getUsers();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const searchUser = async (req: Request, res: Response) => { 
    try {
        const query = req.body
        const result: DataResponse<User> = await userService.searchUser(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeUser = async (req: Request, res: Response) => {
    try {
        let { 
            username,
            password,
        } = req.body
        const roleId = parseInt(req.body.role_id)
        const isDefaulPassword: boolean = req.body.default_password === 1
        const data: UserData = {
            username,
            password,
            roleId,
        }
        const result: DataOptionResponse<User> = await userService.storeUser(data, isDefaulPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateUser = async (req: Request, res: Response) => {
    try {
        const { 
            username,
        } = req.body
        
        const roleId = parseInt(req.body.role_id)
        const isResetPassword: boolean = req.body.reset_password === 1
        const password = ''

        const data: UserData = {
            username,
            password,
            roleId,
        }

        const userId: number = parseInt(req.params.UserId);
        const result: DataOptionResponse<User> = await userService.updateUser(data, userId, isResetPassword);
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
    searchUser,
    storeUser,
    updateUser,
    deleteUser
}