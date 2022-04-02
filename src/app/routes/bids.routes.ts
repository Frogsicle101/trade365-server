import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as bids from '../controllers/bids.controller';


module.exports = ( app: Express ) => {
    app.route(rootUrl + "/auctions/:id/bids")
        .get(bids.read)
        // .post(bids.create)

};