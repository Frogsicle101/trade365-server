import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as bids from "../models/bids.model";
import * as auctions from "../models/auctions.model"

const read = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET bids for auction ${req.params.id}`);
    try {
        const auction = await auctions.getOne(parseInt(req.params.id, 10));
        if (auction === null) {
            res.statusMessage = "Not Found: There is no auction with that ID";
            res.status(404).send();
        } else {
            const bidsList = await bids.getAll(parseInt(req.params.id, 10));
            res.status(200).send(bidsList);
        }
    } catch (err) {
        res.status(500).send(`ERROR reading bids for auction ${req.params.id}: ${err}`);
    }
};

const create = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`POST new bid for auction ${req.params.id}`);
    try {
        const id = parseInt(req.params.id, 10);
        const auction = await auctions.getOne(id);
        const amount = parseInt(req.body.amount, 10);

        if (auction === null) {
            res.statusMessage = "Not Found: There is no auction with that ID";
        } else if (auction.highestBid >= amount) {
            res.statusMessage = "Forbidden: Bid must be higher than previous bids";
            res.status(403).send();
        } else {
            await bids.insert(id, req.body.authenticatedUserId, amount);
            res.status(201).send();
        }
    } catch (err) {
        res.status(500).send(`ERROR adding new bid for auction ${req.params.id}: ${err}`);
    }
};

export {read, create};