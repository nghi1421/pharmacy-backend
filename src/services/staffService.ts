import { Staff } from '../entity/Staff'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate } from "class-validator"
import { Position } from '../entity/Position';
import { StaffData } from '../global/interfaces/StaffData';
import { Like, Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';
import { DataAndCount, getDataAndCount, getErrors, getMetaData } from '../config/helper';
import { checkExistUniqueCreate, checkExistUniqueUpdate } from '../config/query';
import { QueryParam } from '../global/interfaces/QueryParam';

const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff);
const positionRepository: Repository<Position> = AppDataSource.getRepository(Position);

const getStaffs = (queryParams: QueryParam): Promise<DataResponse<Staff>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const search  = queryParams.searchColumns.map((param) => {
                const object:any = {}
                    object[param] = Like(`%${queryParams.searchTerm}%`)
                    return object
                }
            )
            
            const order: any = {}
            order[queryParams.orderBy] = queryParams.orderDirection

            const result: DataAndCount = await getDataAndCount(queryParams, staffRepository, search, order);
       
            resolve({
                message: 'Lấy thông tin nhân viên thành công.',
                data: result.data,
                meta: await getMetaData(queryParams, result.total)
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
            newStaff.identification = data.identification;
            newStaff.isWorking = data.isWorking;
            if (data.address) {
                newStaff.address = data.address
            }

            if (data.dob) {
                 newStaff.dob = new Date(data.dob)
            }

            newStaff.position = position;

            const errors = await validate(newStaff)
        
            if (errors.length > 0) {
                return reject({validateError: getErrors(errors)})
            }

            const errorResponse = []
            const [{ exists: existsPhoneNumber }] = await
                checkExistUniqueCreate(staffRepository, 'phone_number', data.phoneNumber)
            const [{ exists: existsIdentification }] = await
                checkExistUniqueCreate(staffRepository, 'identification', data.identification)
            const [{ exists: existsEmail }] = await
                checkExistUniqueCreate(staffRepository, 'email', data.email)
            
            if (existsPhoneNumber) {
                errorResponse.push({
                    key: 'phoneNumber',
                    value: ['Số điện thoại đã tồn tại.']
                })
            }
            if (existsIdentification) {
                errorResponse.push({
                    key: 'identification',
                    value: ['CCCD đã tồn tại.']
                })
            }
            if (existsEmail) {
                errorResponse.push({
                    key: 'email',
                    value: ['Email đã tồn tại.']
                })
            }

            if (errorResponse.length > 0) {
                return reject({validateError: errorResponse})
            }

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
            staff.isWorking = data.isWorking;
            staff.identification = data.identification;
            if (data.address) {
                staff.address = data.address
            }
            if (data.dob) {
                 staff.dob = new Date(data.dob)
            }

            staff.position = position;

            const errors = await validate(staff)
            if (errors.length > 0) {
                return reject({validateError: errors})
            }

            const errorResponse = []
            const [{ exists: existsPhoneNumber }] = await
                checkExistUniqueUpdate(staffRepository, 'phone_number', [data.phoneNumber, staff.id])
            const [{ exists: existsIdentification }] = await
                checkExistUniqueUpdate(staffRepository, 'identification', [data.identification, staff.id])
            const [{ exists: existsEmail }] = await
                checkExistUniqueUpdate(staffRepository, 'email', [data.email, staff.id])
            
            if (existsPhoneNumber) {
                errorResponse.push({
                    key: 'phoneNumber',
                    value: ['Số điện thoại đã tồn tại.']
                })
            }
            if (existsIdentification) {
                errorResponse.push({
                    key: 'identification',
                    value: ['CCCD đã tồn tại.']
                })
            }
            if (existsEmail) {
                errorResponse.push({
                    key: 'email',
                    value: ['Email đã tồn tại.']
                })
            }

            if (errorResponse.length > 0) {
                return reject({validateError: errorResponse})
            }

            await staffRepository.save(staff)
            resolve({
                message: 'Cập nhật thông tin nhân viên thành công.',
                data: staff
            })
        } catch (error) {
            reject(error)
        }
    })
}

const updateStaffStatus = (staffId: number): Promise<DataOptionResponse<Staff>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let staff: Staff|null = await staffRepository.findOneBy({ id: staffId });
            if (!staff) {
                return resolve({
                    errorMessage: 'Thông tin nhân viên không tồn tại. Vui lòng làm mới trang.'
                })
            }
            staff.isWorking = !staff.isWorking;
            await staffRepository.save(staff)
            resolve({
                message: 'Chuyển trạng thái nhân viên  thành công.',
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
            reject({errorMessage: 'Nhân viên đã có hành động trên hệ thông. Không thể xóa thông tin nhân viên này.'});
        }
    })
}

export default {
    getStaffs,
    getStaff,
    storeStaff,
    updateStaff,
    updateStaffStatus,
    deleteStaff
}