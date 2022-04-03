import {Express} from "express";
import {body} from "express-validator";
import {rootUrl} from "./base.routes"


import * as users from '../controllers/users.controller';
import {loginRequired} from "../middleware/authenticate.middleware";
import {checkErrors} from "../middleware/errors.middleware";

module.exports = ( app: Express ) => {
    app.route(rootUrl + '/users/:id')
        .get(users.read)
        .patch(
            loginRequired,
            body("firstName")
                .optional()
                .isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character"),
            body("lastName")
                .optional().isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character"),
            body("email")
                .optional().isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character")
                .isEmail().withMessage("should be an email"),
            body("password")
                .optional().isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character"),
            body("currentPassword")
                .optional().isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character"),
            checkErrors,
            users.update)
    app.route(rootUrl + "/users/register")
        .post(
            body("firstName")
                .exists().isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character"),
            body("lastName")
                .exists().isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character"),
            body("email")
                .exists().isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character")
                .isEmail().withMessage("should be an email"),
            body("password")
                .exists().isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character"),
            checkErrors,
            users.create
        );
    app.route(rootUrl + "/users/login")
        .post(
            body("email")
                .exists().isString()
                .isEmail().withMessage("should be an email")
                .isLength({min: 1}).withMessage("should not be shorter than 1 character"),
            body("password")
                .exists().isString()
                .isLength({min: 1}).withMessage("should not be shorter than 1 character"),
            checkErrors,
            users.login
        );
    app.route(rootUrl + "/users/logout")
        .post(
            loginRequired,
            users.logout
        )
};