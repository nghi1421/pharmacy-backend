import { Position } from '../entity/Position'
import { AppDataSource } from '../dataSource' 
import { DataResponse } from '../global/interfaces/DataResponse';
import { validateOrReject } from "class-validator"
import { Repository } from 'typeorm';
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse';

const positionRepository: Repository<Position> = AppDataSource.getRepository(Position);

const getPositions = (): Promise<DataResponse<Position>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const positions = await positionRepository.find();
            resolve({
                message: 'Get positions successfully',
                data: positions
            })
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
                message: 'Search positions successfully',
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

            await validateOrReject(newPosition)

            await positionRepository.save(newPosition)
            resolve({
                message: 'Insert position successfully',
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

            await validateOrReject(position)

            await positionRepository.save(position)
            resolve({
                message: 'Update position successfully',
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
                message: 'Position deleted successfully',
                data: position
            })
        } catch (error) {
            reject(error);
        }
    })
}

export default {
    getPositions,
    searchPosition,
    storePosition,
    updatePosition,
    deletePosition
}