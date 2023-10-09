import { Request, Response } from 'express'
import positionService from '../services/positionService'

const getPositions = async (req: Request, res: Response) => {
    try {
        const result = await positionService.getPositions();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const searchPosition = async (req: Request, res: Response) => { 
    try {
        const query = req.body
        const result = await positionService.searchPosition(query);
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
                errorMessage: 'Missing parameters'
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
                errorMessage: 'Missing parameters'
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
                errorMessage: 'Missing parameters'
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
    searchPosition,
    storePosition,
    updatePosition,
    deletePosition
}