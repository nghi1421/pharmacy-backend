import { Position } from '../entity/Position'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validate, validateOrReject } from "class-validator"
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';
import { GetDataResponse } from '../global/interfaces/GetDataResponse';
import { checkExistUniqueCreate, checkExistUniqueUpdate } from '../config/query';

const positionRepository: Repository<Position> = AppDataSource.getRepository(Position);

const getPositions = (): Promise<DataResponse<Position>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const positions = await positionRepository.find();
            resolve({
                message: 'Lấy thông tin chức vụ thành công.',
                data: positions
            })
        } catch (error) {
            reject(error);
        }
    })
}

const getPosition = (positionId: number): Promise<GetDataResponse<Position>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const result: Position|null = await positionRepository.findOneBy({ id: positionId });
            if (result) {
                resolve({
                    message: 'Lấy thông tin chức vụ thành công.',
                    data: result
                })
            }
            else {
                reject({
                    errorMessage: 'Chức vụ không tồn tại. Vui lòng làm mới trang.'
                });
            }
        } catch (error) {
            reject(error);
        }
    })
}

const searchPosition = (query: Object): Promise<DataResponse<Position>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const positions = await positionRepository.find({ where: query});
            resolve({
                message: 'Tìm kiếm thông tin chức vụ thành công.',
                data: positions
            })
        } catch (error) {
            reject(error);
        }
    })
}

const storePosition =
    (name: string): Promise<DataOptionResponse<Position>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let newPosition = new Position();

            newPosition.name = name;

            const errors = await validate(newPosition)
            if (errors.length > 0) {
                return reject({ validateError: errors });
            }
            
            const [{ exists }] = await checkExistUniqueCreate(positionRepository, 'name', [name])
            
            if (exists) {
                return reject([{
                    key: 'name',
                    value: ['Tên chức vụ đã tồn tại.']
                }])
            }

            await positionRepository.save(newPosition)
            resolve({
                message: 'Thêm thông tin chức vụ thành công.',
                data: newPosition
            })
        } catch (error) {
            reject(error);
        }
    })
}

const updatePosition =
    (name: string, positionId: number): Promise<DataOptionResponse<Position>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let position = await positionRepository.findOneByOrFail({ id: positionId });

             position.name = name;

            const errors = await validate(position)
            if (errors.length > 0) {
                return reject({ validateError: errors });
            }
            
            const [{ exists }] = await checkExistUniqueUpdate(positionRepository, 'name', [name, position.id])
            
            if (exists) {
                return reject([{
                    key: 'name',
                    value: ['Tên chức vụ đã tồn tại.']
                }])
            }

            await positionRepository.save(position)
            resolve({
                message: 'Cập nhật thông tin chức vụ thành công.',
                data: position
            })
        } catch (error) {
            reject(error);
        }
    })
}

const deletePosition = (positionId: number): Promise<DataOptionResponse<Position>> => {
    return new Promise(async (resolve, reject) => {
        try {
            let position: Position = await positionRepository.findOneByOrFail({ id: positionId });

            await positionRepository.delete(positionId);

            resolve({
                message: 'Xóa thông tin chức vụ thành công.',
                data: position
            })
        } catch (error) {
            reject({errorMessage: 'Chức vụ đã được cấp cho nhân viên. Không thể xóa thông tin chức vụ này.'});
        }
    })
}

export default {
    getPositions,
    getPosition,
    searchPosition,
    storePosition,
    updatePosition,
    deletePosition
}