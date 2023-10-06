import { Request, Response } from 'express'
import staffService from '../services/staffService'

const getStaffs = async (req: Request, res: Response) => {
    try {
        const result = await staffService.getStaffs();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const searchStaff = async (req: Request, res: Response) => { 
    try {
        const query = req.body
        const result = await staffService.searchStaff(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

///////////////////////////////////////////////////////////
const storeStaff = async (req: Request, res: Response) => {
    try {
        const data = req.body
        const positionId: number = parseInt(req.body.position_id);
        const result = await staffService.storeStaff(data, positionId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateStaff = async (req: Request, res: Response) => {
    try {
        const query = req.body
        const result = await staffService.searchStaff(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteStaff = async (req: Request, res: Response) => {
    try {
        const query = req.body
        const result = await staffService.searchStaff(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getStaffs,
    searchStaff,
    storeStaff,
    updateStaff,
    deleteStaff
}