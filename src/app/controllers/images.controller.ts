import * as auctions from '../models/auctions.model';
import * as users from '../models/users.model';
import {Request, Response} from "express";
import fs from 'mz/fs';
import {getImagePath} from "../models/auctions.model";

const readAuctionImage = async (req: Request, res: Response) : Promise<void> => {
    const id = req.params.id;

    try {
        const numericId = parseInt(id, 10);
        const filename = await auctions.getImagePath(numericId);
        if (filename === null || filename === "null") {
            res.status(404).send();
        } else {
            res.sendFile(filename, {root: 'storage/images'});
        }


    } catch( err ) {
        res.status( 500 ).send( `ERROR reading auction image id: ${id}: ${ err }`
        );
    }
};

const putAuctionImage = async (req: Request, res: Response) : Promise<void> => {
    const id = req.params.id;

    try {
        const numericId = parseInt(id, 10);
        const auction = await auctions.getOne(numericId);

        if (auction === null) {
            res.status(404).send();
        } else if (req.body.authenticatedUserId !== auction.sellerId) {
            res.status(403).send();
        } else if (!req.is(["image/png", "image/jpeg", "image/gif"])) {
            res.status(400).send();
        } else {

            const filePath = "storage/images/auction_" + auction.auctionId + getExtension(req)
            await fs.writeFile(filePath, req.body);
            const oldPath = await getImagePath(numericId)
            await auctions.setImagePath(numericId, "auction_" + auction.auctionId + getExtension(req));
            if (oldPath === null) {
                res.status(201).send();
            } else {
                res.status(200).send();
            }
        }

    } catch( err ) {
        res.status( 500 ).send( `ERROR setting image for auction ${id}: ${ err }`);
    }
};

const readUserImage = async (req: Request, res: Response) : Promise<void> => {
    const id = req.params.id;

    try {
        const numericId = parseInt(id, 10);
        const filename = await users.getImagePath(numericId);
        if (filename === null || filename === "null") {
            res.status(404).send();
        } else {
            res.sendFile(filename, {root: 'storage/images'});
        }


    } catch( err ) {
        res.status( 500 ).send( `ERROR reading auction image id: ${id}: ${ err }`
        );
    }
};

const putUserImage = async (req: Request, res: Response) : Promise<void> => {
    const id = req.params.id;

    try {
        const numericId = parseInt(id, 10);
        const user = await users.getOne(numericId);

        if (user.length === 0) {
            res.status(404).send();
        } else if (req.body.authenticatedUserId !== numericId) {
            res.status(403).send();
        } else if (!req.is(["image/png", "image/jpeg", "image/gif"])) {
            res.status(400).send();
        } else {

            const filePath = "storage/images/user_" + numericId + getExtension(req)
            await fs.writeFile(filePath, req.body);
            const oldPath = await users.getImagePath(numericId)
            await users.setImagePath(numericId, "user_" + numericId + getExtension(req));
            if (oldPath === null) {
                res.status(201).send();
            } else {
                res.status(200).send();
            }
        }

    } catch( err ) {
        res.status( 500 ).send( `ERROR setting image for user ${id}: ${ err }`);
    }
};

const deleteUserImage = async (req: Request, res: Response) : Promise<void> => {
    const id = req.params.id;

    try {
        const numericId = parseInt(id, 10);
        const user = await users.getOne(numericId);

        const filename = await users.getImagePath(numericId);

        if (filename === null || filename === "null") {
            res.status(404).send();
        } else if (user.length === 0) {
            res.status(404).send();
        } else if (req.body.authenticatedUserId !== numericId) {
            res.status(403).send();
        } else {
            await fs.unlink("storage/images/" + filename);
            await users.deleteImagePath(numericId);
            res.status(200).send();


        }

    } catch( err ) {
        res.status( 500 ).send( `ERROR deleting image for user ${id}: ${ err }`);
    }
};


const getExtension = (req: Request) => {
    switch (req.get('Content-Type')) {
        case "image/png":
            return ".png";
        case "image/jpeg":
            return ".jpg";
        case "image/gif":
            return ".gif";
        default:
            throw Error("Tried to get extension of an invalid content type");
    }
}




export {readAuctionImage, putAuctionImage, readUserImage, putUserImage, deleteUserImage}