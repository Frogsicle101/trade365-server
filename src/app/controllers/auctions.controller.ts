import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as auctions from "../models/auctions.model";
import moment from 'moment';
import {Properties} from "../../auction_types";

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
            res.statusMessage = "Bad Request: Invalid sorting"
            res.status(400).send();
            return
        } else {
            sortBy = req.query.sortBy.toString();
        }
    }


    try {
        const result = await auctions.getAll(startIndex, count, q, categoryIds, sellerId, bidderId, sortBy);
        res.status(200).send({
            count: result.count,
            auctions: result.rows
        });

    } catch (err) {
        res.status(500).send(`ERROR listing auctions ${err}`
        );
    }
};

const create = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`POST create an auction`)

    let reserve: number = 1;
    if (req.body.hasOwnProperty("reserve")) {
        reserve = parseInt(req.body.reserve, 10);
    }

    const currentDate = moment().format("YYYY-MM-DD HH:mm:ss.sss");
    if (req.body.endDate < currentDate) {
        res.statusMessage = "Bad Request: Date must be in future";
        res.status(400).send();
        return
    }

    const categoryId = parseInt(req.body.categoryId, 10);


    if (!await auctions.categoryExists(categoryId)) {
        res.statusMessage = "Bad Request: Invalid category ID";
        res.status(400).send();
        return
    }


    try {
        const result = await auctions.insert(req.body.title, req.body.description, req.body.categoryId, req.body.endDate, reserve, req.body.authenticatedUserId);
        res.status(201).send({"auctionId": result.insertId});
    } catch (err) {
        res.status(500).send(`ERROR creating auction: ${err}`);
    }
};

const update = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`PATCH single auction id: ${req.params.id}`)
    try {
        const auction = await auctions.getOne(parseInt(req.params.id, 10));

        if (auction === null) {
            res.statusMessage = "Not Found: There is no auction with that ID";
            res.status(404).send();
            return
        } else if (req.body.authenticatedUserId !== auction.sellerId) {
            res.statusMessage = "Forbidden: You are not permitted to edit someone else's auction";
            res.status(403).send();
            return
        } else if (auction.numBids !== 0) {
            res.statusMessage = "Forbidden: There are already bids on that auction";
            res.status(403).send();
            return
        } else {
            const properties: Partial<Properties> = {};

            if (req.body.hasOwnProperty("title")) {
                properties.title = req.body.title;
            }
            if (req.body.hasOwnProperty("description")) {
                properties.description = req.body.description;
            }
            if (req.body.hasOwnProperty("categoryId")) {
                const id = parseInt(req.body.categoryId, 10);
                if (!(await auctions.categoryExists(id))) {
                    res.statusMessage = "Bad Request: That category id does not exist";
                    res.status(400).send();
                    return
                }
                properties.category_id = id;
            }
            if (req.body.hasOwnProperty("reserve")) {
                properties.reserve = parseInt(req.body.reserve, 10);
            }

            await auctions.update(auction.auctionId, properties);
            res.status(200).send();


        }
    } catch (err) {
        res.status(500).send(`ERROR updating auction : ${err}`);
    }
}

const read = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET single auction id: ${req.params.id}`)
    const id = req.params.id;
    try {
        const result = await auctions.getOne(parseInt(id, 10));
        if (result === null) {
            res.statusMessage = "Not Found: That auction does not exist";
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        res.status(500).send(`ERROR reading auction ${id}: ${err}`);
    }
};

const remove = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`DELETE single auction id: ${req.params.id}`)

    try {
        const id = parseInt(req.params.id, 10);

        const auction = await auctions.getOne(id);

        if (auction === null) {
            res.statusMessage = "Not Found: That auction does not exist";
            res.status(404).send()
        } else if (auction.numBids > 0) {
            res.statusMessage = "Forbidden: There are already bids on that auction";
            res.status(403).send();
        } else if (auction.sellerId !== req.body.authenticatedUserId) {
            res.statusMessage = "Forbidden: You are not permitted to edit someone else's auction";
            res.status(403).send();
        } else {
            await auctions.remove(id);
            res.status(200).send();
        }



    } catch (err) {
        res.status(500).send(`ERROR removing auction ${req.params.id}: ${err}`);
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
        res.status(500).send(`ERROR reading auction ${id}: ${err}`);
    }
};

export {list, read, create, update, remove, readCategories};