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
            res.status(400).json({
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
            res.status(400).json({
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
        const { 
            name,
            phone_number,
            email,
            dob,
            address,
            identification,
            gender,
        } = req.body
        let isWorking = req.body.is_working
        if (!isWorking) {
            isWorking = true;
        }
        const data: StaffData = {
            name,
            email,
            dob,
            address,
            identification,
            gender,
            phoneNumber: phone_number,
            isWorking,
        }
        const positionId: number = parseInt(req.body.position_id);
        if (!positionId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
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
            phone_number,
            email,
            dob,
            address,
            identification,
            is_working,
            gender,
        } = req.body
        
        const data: StaffData = {
            name,
            email,
            dob,
            address,
            identification,
            gender,
            phoneNumber: phone_number,
            isWorking:  is_working,
        }

        const positionId: number = parseInt(req.body.position_id);
        const staffId: number = parseInt(req.params.staffId);
        if (!positionId || !staffId) {
            res.status(400).json({
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
            res.status(400).json({
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