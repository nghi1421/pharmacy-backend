import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { Repository } from 'typeorm';
import { Role } from '../entity/Role';

const roleRepository: Repository<Role> = AppDataSource.getRepository(Role);

const getRoles = (): Promise<DataResponse<Role>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const staffs = await roleRepository.find();
            resolve({
                message: 'Get roles successfully',
                data: staffs
            })
        } catch (error) {
            reject(error);
        }
    })
}
export default {
    getRoles,
}