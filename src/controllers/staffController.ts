import { Request, Response } from 'express'
import staffService from '../services/staffService'
import { StaffData } from '../global/interfaces/StaffData';
import { QueryParam } from '../global/interfaces/QueryParam';
import { getQueryParams } from '../config/helper';

const getStaffs = async (req: Request, res: Response) => {
    try {
        const queryParams: QueryParam = await getQueryParams(req)
        const result = await staffService.getStaffs(queryParams);
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
        if (error.validateError) {
            res.status(400).json(error)
        }
        else {
            res.status(500).send(error)
        }
    }
}

const updateStaff = async (req: Request, res: Response) => {
    try {
        let { 
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
            gender: parseInt(gender),
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
        if (error.validateError) {
            res.status(400).json(error)
        }
        else {
            res.status(500).send(error)
        }
    }
}

const updateStaffStatus = async (req: Request, res: Response) => {
    try {
        const staffId: number = parseInt(req.params.staffId);
        if (!staffId) {
            res.status(200).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await staffService.updateStaffStatus(staffId);
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
    updateStaffStatus,
    storeStaff,
    updateStaff,
    deleteStaff
}