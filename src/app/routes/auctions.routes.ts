import {Express} from "express";
import {body, param, query} from "express-validator";
import {rootUrl} from "./base.routes"
import * as auctions from '../controllers/auctions.controller';
import {loginRequired} from "../middleware/authenticate.middleware";
import {checkErrors} from "../middleware/errors.middleware";


module.exports = ( app: Express ) => {
    app.route(rootUrl + '/auctions/categories')
        .get(auctions.readCategories);
    app.route(rootUrl + '/auctions/:id')
        .get(
            param("id").isInt(),
            checkErrors,
            auctions.read)
        .delete(
            loginRequired,
            param("id").isInt(),
            checkErrors,
            auctions.remove
        )
        .patch(loginRequired,
            param("id").isInt(),
            body("title")
                .optional().isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character"),
            body("description")
                .optional().isString(),
            body("categoryId")
                .optional().isInt(),
            body("endDate")
                .optional().isString(),
            body("reserve")
                .optional().isInt({min: 1}).withMessage("should be a number greater than 0"),
            checkErrors,
            auctions.update)
    app.route(rootUrl + '/auctions')
        .get(
            query("startIndex")
                .optional().isInt({min: 0}).withMessage("should be a number greater than 0"),
            query("count")
                .optional().isInt({min: 0}).withMessage("should be a number greater than 0"),
            query("q")
                .optional().isString().withMessage("should be a string"),
            query("sellerId")
                .optional().isInt().withMessage("should be a number"),
            query("bidderId")
                .optional().isInt().withMessage("should be a number"),
            query("sortBy")
                .optional().isString().withMessage("should be a string"),
            checkErrors,
            auctions.list
        )
        .post(
            loginRequired,
            body("title")
                .exists().isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character"),
            body("description")
                .exists().isString(),
            body("categoryId")
                .exists().isInt(),
            body("endDate")
                .exists().isString(),
            body("reserve")
                .optional().isInt({min: 1}).withMessage("should be a number greater than 0"),
            checkErrors,
            auctions.create
        )

};