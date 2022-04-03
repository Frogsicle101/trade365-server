import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as bids from '../controllers/bids.controller';
import {loginRequired} from "../middleware/authenticate.middleware";
import {body, param} from "express-validator";
import {checkErrors} from "../middleware/errors.middleware";


module.exports = ( app: Express ) => {
    app.route(rootUrl + "/auctions/:id/bids")
        .get(
            param("id").isInt(),
            checkErrors,
            bids.read
        )
        .post(
            loginRequired,
            param("id").isInt(),
            body("amount")
                .exists().isInt({min: 1}).withMessage("should be a number greater than 0"),
            checkErrors,
            bids.create
        )

};