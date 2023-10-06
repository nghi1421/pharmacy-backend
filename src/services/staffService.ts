import { Staff } from '../entity/Staff'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { Position } from '../entity/Position';

const staffRepository = AppDataSource.getRepository(Staff);
const manager = AppDataSource.manager;
const positionRepository = AppDataSource.getRepository(Position);

const getStaffs = () => {
    return new Promise<DataResponse<Staff>>(async (resolve, reject) => {
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

const searchStaff = (query: Object) => {
    return new Promise<DataResponse<Staff>>(async (resolve, reject) => {
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

const storeStaff = (data: any, positionId: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const position = await positionRepository.findOneByOrFail({ id: positionId });
  
            let newStaff = new Staff();
            console.log(data);
            newStaff.name = data?.name;
            newStaff.email = data?.email;
            newStaff.phoneNumber = data?.phone_number;
            newStaff.gender = data?.gender;
            newStaff.address = data?.address ? data.address : '';
            newStaff.identification = data?.identification;
            newStaff.dob = data?.dob ? new Date(data.dob) : new Date();

            newStaff.position = position;

            const errors = await validate(newStaff)
            
            if (errors.length > 0) {
                reject({ errorMessage: 'Invalid information.'})
            }

            manager.save(newStaff)
            resolve({
                message: 'Insert staff successfully',
                data: newStaff
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getStaffs,
    searchStaff,
    storeStaff
}