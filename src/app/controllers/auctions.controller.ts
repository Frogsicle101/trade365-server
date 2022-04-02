import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as auctions from "../models/auctions.model";

const list = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET multiple auctions`)

    let startIndex: number = 0;
    let count = null;
    let q = null;
    let categoryIds = null;
    let sellerId = null;
    let bidderId = null;
    let sortBy = "CLOSING_SOON";

    if (req.query.hasOwnProperty("startIndex")) {
        startIndex = parseInt(req.query.startIndex.toString(), 10);
    }
    if (req.query.hasOwnProperty("count")) {
        count = parseInt(req.query.count.toString(), 10);
    }
    if (req.query.hasOwnProperty("q")) {
        q = req.query.q.toString();
    }
    if (req.query.hasOwnProperty("categoryIds")) {
        categoryIds = (Array.isArray(req.query.categoryIds) ? req.query.categoryIds : [req.query.categoryIds])
            .map(id => parseInt(id.toString(), 10));


    }
    if (req.query.hasOwnProperty("sellerId")) {
        sellerId = parseInt(req.query.sellerId.toString(), 10);
    }
    if (req.query.hasOwnProperty("bidderId")) {
        bidderId = parseInt(req.query.bidderId.toString(), 10);
    }
    if (req.query.hasOwnProperty("sortBy")) {

        const validSorts = ["ALPHABETICAL_ASC", "ALPHABETICAL_DESC", "CLOSING_SOON", "CLOSING_LAST", "BIDS_ASC",
            "BIDS_DESC", "RESERVE_ASC", "RESERVE_DESC"];
        if (!validSorts.includes(req.query.sortBy.toString())) {
            res.statusMessage += "Invalid sorting"
            res.status(400).send();
            return
        } else {
            sortBy = req.query.sortBy.toString();
        }
    }


    try {
        const result = await auctions.getAll(startIndex, count, q, categoryIds, sellerId, bidderId, sortBy);
        res.status(200).send({
            count: result.length,
            auctions: result
        });

    } catch (err) {
        res.status(500).send(`ERROR listing auctions ${err}`
        );
    }
};


const read = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET single auction id: ${req.params.id}`)
    const id = req.params.id;
    try {
        const result = await auctions.getOne(parseInt(id, 10));
        if (result === null) {
            res.status(404).send('Auction not found');
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        res.status(500).send(`ERROR reading auction ${id}: ${err}`
        );
    }
};

const remove = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`DELETE single auction id: ${req.params.id}`)
    const id = req.params.id;
    try {
        const result = await auctions.remove(parseInt(id, 10));
        if (result === null) {
            res.status(404).send('Auction not found');
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        res.status(500).send(`ERROR reading auction ${id}: ${err}`
        );
    }
};

const readCategories = async (req: Request, res: Response): Promise<void> => {
    Logger.http("GET all categories")
    const id = req.params.id;
    try {
        const result = await auctions.getCategories();
        const array = result.map((row) => {
            return {
                categoryId: row.id,
                name: row.name
            }
        });
        res.status(200).send(array);
    } catch (err) {
        res.status(500).send(`ERROR reading auction ${id}: ${err}`
        );
    }
};

export {list, read, remove, readCategories};