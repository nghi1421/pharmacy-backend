import { Request, Response } from "express";
import troubleService from "../services/troubleService";

const getHistoryBatchTrouble = async (req: Request, res: Response) => {
    try {
        const batchId = req.params.batchId;
        const drugId = parseInt(req.params.drugId);
        const result = await troubleService.getHistoryBatchTrouble(batchId, drugId)
        res.json(result);
    }
    catch (error) {
        res.status(400).send(error)
    }
}

export default {
    getHistoryBatchTrouble
}