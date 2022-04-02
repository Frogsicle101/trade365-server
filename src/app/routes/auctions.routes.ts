import {Express} from "express";
import {body} from "express-validator";
import {rootUrl} from "./base.routes"
import * as auctions from '../controllers/auctions.controller';
import {loginRequired} from "../middleware/authenticate.middleware";


module.exports = ( app: Express ) => {
    app.route(rootUrl + '/auctions/categories')
        .get(auctions.readCategories);
    app.route(rootUrl + '/auctions/:id')
        .get(auctions.read)
        .delete(
            loginRequired,
            auctions.remove
        )
        .patch(loginRequired,
            auctions.update)
    app.route(rootUrl + '/auctions')
        .get(auctions.list)
        .post(
            loginRequired,
            body(["title", "description", "endDate", "categoryId"]).exists(),
            auctions.create
        )

};