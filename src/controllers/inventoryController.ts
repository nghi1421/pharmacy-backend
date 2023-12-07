import { Request, Response } from "express";
import inventoryService from "../services/inventoryService";
import { QueryParam } from "../global/interfaces/QueryParam";
import { getQueryParams } from "../utils/helper";

const getInventories = async (req: Request, res: Response) => {
    try {
        const queryParams: QueryParam = await getQueryParams(req)
        const result = await inventoryService.getInventories(queryParams);
        res.json(result)
    }
    catch (error) {
        res.status(500).send(error)
    }
}

export default {
    getInventories
}