import { Staff } from '../entity/Staff'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../contracts/DataResponse';

const staffRepository = AppDataSource.getRepository(Staff);

const getStaffs = () => {
    return new Promise<DataResponse>(async (resolve, reject) => {
        try {
            const staffs = await staffRepository.find();
            resolve({
                message: 'Get staff information successfully',
                data: staffs
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getStaffs,
}