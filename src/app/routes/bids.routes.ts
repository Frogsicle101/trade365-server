import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as bids from '../controllers/bids.controller';
import {loginRequired} from "../middleware/authenticate.middleware";
import {body} from "express-validator";


module.exports = ( app: Express ) => {
    app.route(rootUrl + "/auctions/:id/bids")
        .get(bids.read)
        .post(loginRequired,
            body("amount").exists(),
            bids.create
        )

};