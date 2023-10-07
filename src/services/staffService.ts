import { Staff } from '../entity/Staff'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { Position } from '../entity/Position';
import { StaffData } from '../global/interfaces/StaffData';
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';

const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff);
const positionRepository: Repository<Position> = AppDataSource.getRepository(Position);

const getStaffs = (): Promise<DataResponse<Staff>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const staffs = await staffRepository.find();
            resolve({
                message: 'Get staffs successfully',
                data: staffs
            })
        } catch (error) {
            reject(error);
        }
    })
}

const searchStaff = (query: Object): Promise<DataResponse<Staff>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const staff = await staffRepository.find({ where: query});
            resolve({
                message: 'Search staffs successfully',
                data: staff
            })
        } catch (error) {
            reject(error);
        }
    })
}

const storeStaff =
    (data: StaffData, positionId: number): Promise<DataOptionResponse<Staff>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const position = await positionRepository.findOneByOrFail({ id: positionId });
  
            let newStaff = new Staff();

            newStaff.name = data.name;
            newStaff.email = data.email;
            newStaff.phoneNumber = data.phoneNumber;
            newStaff.gender = data.gender;
            newStaff.address = data.address ? data.address : '';
            newStaff.identification = data.identification;
            newStaff.dob = data.dob ? new Date(data.dob) : new Date();

            newStaff.position = position;

            const errors = await validate(newStaff)
            
            if (errors.length > 0) {
                reject({ errorMessage: 'Invalid information.'})
            }

            await staffRepository.save(newStaff)
            resolve({
                message: 'Insert staff successfully',
                data: newStaff
            })
        } catch (error) {
            reject(error);
        }
    })
}

const updateStaff =
    (staffId: number, data: StaffData, positionId: number): Promise<DataOptionResponse<Staff>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const position = await positionRepository.findOneByOrFail({ id: positionId });
  
            let staff = await staffRepository.findOneByOrFail({ id: staffId });

            staff.name = data.name;
            staff.phoneNumber = data.phoneNumber;
            staff.gender = data.gender;
            staff.email = data.email;
            staff.address = data.address ? data.address : '';
            staff.identification = data.identification;
            if (data.dob) {
                staff.dob = new Date(data.dob)
            }

            staff.position = position;

            const errors = await validate(staff)
            if (errors.length > 0) {
                reject({ errorMessage: 'Invalid information.'})
            }

            await staffRepository.save(staff)
            resolve({
                message: 'Update staff successfully',
                data: staff
            })
        } catch (error) {
            reject(error)
        }
    })
}

const deleteStaff = (staffId: number): Promise<DataOptionResponse<Staff>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let staff: Staff = await staffRepository.findOneByOrFail({ id: staffId });

            await staffRepository.delete(staffId);

            resolve({
                message: 'Staff deleted successfully',
                data: staff
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getStaffs,
    searchStaff,
    storeStaff,
    updateStaff,
    deleteStaff
}