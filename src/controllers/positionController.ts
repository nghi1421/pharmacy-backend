import { Request, Response } from 'express'
import positionService from '../services/positionService'
import { QueryParam } from '../global/interfaces/QueryParam';
import { getQueryParams } from '../utils/helper';

const getPositions = async (req: Request, res: Response) => {
    try {
        if (req.query.perPage) {
            const queryParams: QueryParam = await getQueryParams(req)
            const result = await positionService.getPositions(queryParams);
            res.status(200).json(result);
        }
        else {
            const result = await positionService.getPositions(undefined);
            res.status(200).json(result);
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

const getPosition = async (req: Request, res: Response) => {
    try {
        const positionId: number = parseInt(req.params.positionId)
        if (!positionId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await positionService.getPosition(positionId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const storePosition = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;

        if (!name) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }

        const result = await positionService.storePosition(name);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const updatePosition = async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;
        const positionId: number = parseInt(req.params.positionId);

        if (!name || !positionId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }
        const result = await positionService.updatePosition(name, positionId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const deletePosition = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.positionId)

        if (!positionId) {
            res.status(400).json({
                errorMessage: 'Thiếu tham số đầu vào.'
            })
            return;
        }

        const result = await positionService.deletePosition(positionId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getPositions,
    getPosition,
    storePosition,
    updatePosition,
    deletePosition
}