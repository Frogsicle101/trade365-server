import {Express} from "express";
import {rootUrl} from "./base.routes"


import * as images from '../controllers/images.controller';
import {loginRequired} from "../middleware/authenticate.middleware";
import {param} from "express-validator";
import {checkErrors} from "../middleware/errors.middleware";

module.exports = ( app: Express ) => {
    app.route(rootUrl + "/auctions/:id/image")
        .get(
            param("id").isInt(),
            checkErrors,
            images.readAuctionImage
        )
        .put(
            loginRequired,
            param("id").isInt(),
            checkErrors,
            images.putAuctionImage
        );
    app.route(rootUrl + "/users/:id/image")
        .get(
            param("id").isInt(),
            checkErrors,
            images.readUserImage
        )
        .put(
            loginRequired,
            param("id").isInt(),
            checkErrors,
            images.putUserImage
        )
        .delete(
            loginRequired,
            param("id").isInt(),
            checkErrors,
            images.deleteUserImage
        );

};