import {Express} from "express";
import {body} from "express-validator";
import {rootUrl} from "./base.routes"


import * as users from '../controllers/users.controller';

module.exports = ( app: Express ) => {
    app.route(rootUrl + '/users/:id')
        .get(users.read);
    app.route(rootUrl + "/users/register")
        .post(
            body(["firstName", "lastName", "email", "password"]).exists(),
            body("email").isEmail(),
            users.create
        );
};