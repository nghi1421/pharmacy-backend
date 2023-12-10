import { Request, Response } from "express";
import troubleService from "../services/troubleService";
import { TroubleData } from "../global/interfaces/TroubleData";

const getHistoryBatchTrouble = async (req: Request, res: Response) => {
    try {
        const batchId = req.params.batchId;
        const drugId = parseInt(req.params.drugId);
        const result = await troubleService.getHistoryBatchTrouble(batchId, drugId)
        res.json(result);
    }
    catch (error) {
        res.status(500).send(error)
    }
}

const storeTrouble = async (req: Request, res: Response) => {
    try {
        const {
            note,
            troubleDate,
            drugId,
            batchId
        } = req.body

        const data: TroubleData = {
            staffId: res.locals.staffId,
            note,
            troubleDate: new Date(troubleDate),
            drugId: parseInt(drugId),
            batchId: batchId,
        }

        const result = await troubleService.storeTrouble(data);
        res.json(result)
    }
    catch (error) {
        res.status(500).send(error)
    }
}

const backDrugCategory = async (req: Request, res: Response) => {
    try {
        const exportId = parseInt(req.body.exportId)
        const troubleId = parseInt(req.body.troubleId)
        const quantity = parseInt(req.body.quantity)
        const recoveryTime = new Date(req.body.recoveryTime)
        const result = await troubleService.backDrugCategory(exportId, troubleId, recoveryTime, quantity);
        res.json(result)
    }
    catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getHistoryBatchTrouble,
    storeTrouble,
    backDrugCategory
}