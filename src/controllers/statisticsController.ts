
import { Request, Response } from 'express'
import statisticsService from '../services/statisticsService'

const getStatisticsToday = async (req: Request, res: Response) => {
    try {
        const result = await statisticsService.getStatisticsToday();
        res.status(200).json(result);
        
    } catch (error) {
        res.status(500).send(error)
    }
}

const getStatistics = async (req: Request, res: Response) => {
    try {
        const startDate = req.body.startDate
        const endDate = req.body.endDate
        const result = await statisticsService.getStatistics(startDate, endDate);
        res.status(200).json(result);
        
    } catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getStatisticsToday,
    getStatistics
}