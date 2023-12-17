
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
        const startDate = req.query.startDate as string
        const endDate = req.query.endDate as string

        if (startDate.length > 0 && endDate.length > 0) {
            const result = await statisticsService.getStatistics(startDate, endDate);
            res.status(200).json(result);
            return
        }

        res.status(500).json({ errorMessage: 'Thiếu tham số đầu vào' });

    } catch (error) {
        res.status(500).send(error)
    }
}

const getStatisticsCustomer = async (req: Request, res: Response) => {
    try {
        const customerId = parseInt(req.params.customerId)
        const result = await statisticsService.getStatisticCustomer(customerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error)
    }
}
export default {
    getStatisticsToday,
    getStatistics,
    getStatisticsCustomer
}