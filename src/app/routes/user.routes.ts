import {Express} from "express";
import {rootUrl} from "./base.routes"


import * as users from '../controllers/users.controller';
module.exports = ( app: Express ) => {
    app.route(rootUrl + '/users/:id')
        .get(users.read);
    app.route(rootUrl + "/users/register")
        .post(users.create);
};