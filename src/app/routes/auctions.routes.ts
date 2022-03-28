import {Express} from "express";
import {body} from "express-validator";
import {rootUrl} from "./base.routes"
import * as auctions from '../controllers/auctions.controller';


module.exports = ( app: Express ) => {
    app.route(rootUrl + '/auctions/categories')
        .get(auctions.readCategories);
    app.route(rootUrl + '/auctions/:id')
        .get(auctions.read)
        .delete(auctions.remove);

};