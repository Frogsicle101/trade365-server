import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as auctions from "../models/auctions.model";

const read = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`GET single auction id: ${req.params.id}`)
    const id = req.params.id;
    try {
        const result = await auctions.getOne( parseInt(id, 10) );
        if(result === null) {
            res.status( 404 ).send('Auction not found');
        } else {
            res.status( 200 ).send(result);
        }
    } catch( err ) {
        res.status( 500 ).send( `ERROR reading auction ${id}: ${ err }`
        );
    }
};

const remove = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`DELETE single auction id: ${req.params.id}`)
    const id = req.params.id;
    try {
        const result = await auctions.remove( parseInt(id, 10) );
        if(result === null) {
            res.status( 404 ).send('Auction not found');
        } else {
            res.status( 200 ).send(result);
        }
    } catch( err ) {
        res.status( 500 ).send( `ERROR reading auction ${id}: ${ err }`
        );
    }
};

const readCategories = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("GET all categories")
    const id = req.params.id;
    try {
        const result = await auctions.getCategories();
        const array = result.map((row) => {return {
            categoryId: row.id,
            name: row.name
        }});
        res.status(200).send(array);
    } catch( err ) {
        res.status( 500 ).send( `ERROR reading auction ${id}: ${ err }`
        );
    }
};

export {read, remove, readCategories};