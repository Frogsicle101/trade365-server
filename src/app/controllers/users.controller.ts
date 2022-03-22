import * as users from '../models/users.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";

const read = async (req: Request, res: Response) : Promise<void> =>
{
    Logger.http(`GET single user id: ${req.params.id}`)
    const id = req.params.id;
    try {
        const result = await users.getOne( parseInt(id, 10) );
        if( result.length === 0 ){
            res.status( 404 ).send('User not found');
        } else {
            const user: User = result[0]
            res.status( 200 ).send({
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email
            });
        }
    } catch( err ) {
        res.status( 500 ).send( `ERROR reading user ${id}: ${ err }`
        );
    }
};

const create = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`POST create a user`)

    if (!req.body.hasOwnProperty("firstName")) {
        res.status(400).send("Please provide firstName field");
        return
    }

    if (await users.emailAlreadyRegistered(req.body.email)) {
        res.status(400).send("The email is already in the database");
        return
    }

    try {
        const result = await users.insert(
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            req.body.password
        );
        res.status(201).send({"userId": result.insertId});
    } catch (err) {
        res.status(500).send(`ERROR creating user: ${err}`);
    }
};

export {read, create}