import {Express} from "express";
import {body} from "express-validator";
import {rootUrl} from "./base.routes"


import * as users from '../controllers/users.controller';
import {loginRequired} from "../middleware/authenticate.middleware";

module.exports = ( app: Express ) => {
    app.route(rootUrl + '/users/:id')
        .get(users.read)
        .patch(
            loginRequired,
            users.update)
    app.route(rootUrl + "/users/register")
        .post(
            body(["firstName", "lastName", "email", "password"]).exists(),
            body("email").isEmail(),
            users.create
        );
    app.route(rootUrl + "/users/login")
        .post(
            body(["email", "password"]).exists(),
            body("email").isEmail(),
            users.login
        );
    app.route(rootUrl + "/users/logout")
        .post(
            loginRequired,
            users.logout
        )
};