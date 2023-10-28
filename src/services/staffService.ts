import { Staff } from '../entity/Staff'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate, validateOrReject } from "class-validator"
import { Position } from '../entity/Position';
import { StaffData } from '../global/interfaces/StaffData';
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';

const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff);
const positionRepository: Repository<Position> = AppDataSource.getRepository(Position);

const getStaffs = (): Promise<DataResponse<Staff>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const staffs = await staffRepository.find();
            resolve({
                message: 'Lấy thông tin nhân viên thành công.',
                data: staffs
            })
        } catch (error) {
            reject(error);
        }
    })
}

const getStaff = (staffId: number): Promise<GetDataResponse<Staff>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const result: Staff|null = await staffRepository.findOneBy({ id: staffId });
            if (result) {
                resolve({
                    message: 'Lấy thông tin nhân viên thành công.',
                    data: result
                })
            }
            else {
                resolve({
                    errorMessage: 'Thông tin nhân viên không tồn tại. Vui lòng làm mới trang.'
                });
            }
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
                message: 'Tìm kiếm thông tin nhân viên thành công.',
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
            const position: Position|null = await positionRepository.findOneBy({ id: positionId });
            
            if (!position) {
                return resolve({
                    errorMessage: 'Thông tin chức vụ được chọn không tồn tại.'
                })
            }

            let newStaff = new Staff();

            newStaff.name = data.name;
            newStaff.email = data.email;
            newStaff.phoneNumber = data.phoneNumber;
            newStaff.gender = data.gender;
            newStaff.address = data.address ? data.address : '';
            newStaff.identification = data.identification;
            newStaff.isWorking = data.isWorking;
            newStaff.dob = data.dob ? new Date(data.dob) : new Date();

            newStaff.position = position;

            await validateOrReject(newStaff)

            await staffRepository.save(newStaff)
            resolve({
                message: 'Thêm thông tin nhân viên thành công.',
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
            const position: Position|null = await positionRepository.findOneBy({ id: positionId });
            if (!position) {
                return resolve({
                    errorMessage: 'Thông tin chức vụ được chọn không tồn tại.'
                })
            }

            let staff: Staff|null = await staffRepository.findOneBy({ id: staffId });
            if (!staff) {
                return resolve({
                    errorMessage: 'Thông tin nhân viên không tồn tại. Vui lòng làm mới trang.'
                })
            }
            staff.name = data.name;
            staff.phoneNumber = data.phoneNumber;
            staff.gender = data.gender;
            staff.email = data.email;
            staff.address = data.address ? data.address : '';
            staff.isWorking = data.isWorking;
            staff.identification = data.identification;
            if (data.dob) {
                staff.dob = new Date(data.dob)
            }

            staff.position = position;

            const errors = await validate(staff)
            if (errors.length > 0) {
                return resolve({ errorMessage: 'Thông tin nhân viên không hợp lệ.'})
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
            let staff: Staff|null = await staffRepository.findOneBy({ id: staffId });
            if (!staff) {
                return resolve({
                    errorMessage: 'Thông tin nhân viên không tồn tại. Vui lòng làm mới trang.'
                })
            }

            await staffRepository.delete(staffId);

            resolve({
                message: 'Xóa thông tin nhân viên thành công.',
                data: staff
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getStaffs,
    getStaff,
    searchStaff,
    storeStaff,
    updateStaff,
    deleteStaff
}