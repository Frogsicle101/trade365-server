import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as bids from "../models/bids.model";
import * as auctions from "../models/auctions.model"

const read = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET bids for auction ${req.params.id}`);
    try {
        const result = await auctions.getOne(parseInt(req.params.id, 10));
        if (result === null) {
            res.status(404).send('Auction not found');
        } else {
            const bidsList = await bids.getAll(parseInt(req.params.id, 10));
            res.status(200).send(bidsList);
        }
    } catch (err) {
        res.status(500).send(`ERROR reading bids for auction ${req.params.id}: ${err}`);
    }
};

export {read};