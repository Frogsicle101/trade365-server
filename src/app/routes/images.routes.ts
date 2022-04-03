import {Express} from "express";
import {rootUrl} from "./base.routes"


import * as images from '../controllers/images.controller';
import {loginRequired} from "../middleware/authenticate.middleware";

module.exports = ( app: Express ) => {
    app.route(rootUrl + "/auctions/:id/image")
        .get(images.readAuctionImage)
        .put(
            loginRequired,
            images.putAuctionImage
        );
    app.route(rootUrl + "/users/:id/image")
        .get(images.readUserImage)
        .put(
            loginRequired,
            images.putUserImage
        )
        .delete(
            loginRequired,
            images.deleteUserImage
        );

};