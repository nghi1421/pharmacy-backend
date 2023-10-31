import { Request, Response } from 'express'
import staffService from '../services/staffService'
import { StaffData } from '../global/interfaces/StaffData';

const getStaffs = async (req: Request, res: Response) => {
    try {
        const result = await staffService.getStaffs();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const getStaff = async (req: Request, res: Response) => {
    try {
        const staffId: number = parseInt(req.params.staffId)
        if (!staffId) {
            res.status(200).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await staffService.getStaff(staffId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const searchStaff = async (req: Request, res: Response) => { 
    try {
        const query = req.body
        if (!query) {
            res.status(200).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await staffService.searchStaff(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storeStaff = async (req: Request, res: Response) => {
    try {
        let { 
            name,
            phoneNumber,
            email,
            dob,
            address,
            identification,
            gender,
            isWorking
        } = req.body
        if (!isWorking) {
            isWorking = true;
        }
        const data: StaffData = {
            name,
            email,
            dob,
            address,
            identification,
            gender: parseInt(gender),
            phoneNumber,
            isWorking,
        }

        const positionId: number = parseInt(req.body.positionId);

        const result = await staffService.storeStaff(data, positionId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updateStaff = async (req: Request, res: Response) => {
    try {
        const { 
            name,
            phoneNumber,
            email,
            dob,
            address,
            identification,
            isWorking,
            gender,
        } = req.body
        
        const data: StaffData = {
            name,
            email,
            dob,
            address,
            identification,
            gender,
            phoneNumber,
            isWorking,
        }

        const positionId: number = parseInt(req.body.positionId);
        const staffId: number = parseInt(req.params.staffId);
        if (!positionId || !staffId) {
            res.status(200).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await staffService.updateStaff(staffId, data, positionId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteStaff = async (req: Request, res: Response) => {
    try {
        const staffId: number = parseInt(req.params.staffId);
        if (!staffId) {
            res.status(200).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await staffService.deleteStaff(staffId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getStaffs,
    getStaff,
    searchStaff,
    storeStaff,
    updateStaff,
    deleteStaff
}